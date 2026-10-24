/**
 * Towns seed script — populates the towns table for one state from a CSV.
 *
 * Usage:
 *   node scripts/seed-towns.mjs --state NY --csv data/towns-ny.csv
 *   node scripts/seed-towns.mjs --state NY --csv data/towns-ny.csv --dry-run
 *
 * CSV format (header required):
 *   name,county
 *   "New York","New York"
 *   "Buffalo","Erie"
 *   "Albany","Albany"
 *
 * - Slugs are derived from `name` (lowercased, non-alphanumerics -> hyphens).
 * - Deduplicates within the CSV by slug (keeps first).
 * - Upserts into Supabase keyed on (state, slug) — requires migration 007.
 * - Idempotent: safe to run multiple times.
 * - Reads credentials from .env.local (same pattern as bulk-discover.mjs).
 *
 * Recommended data source for comprehensive town/village/hamlet coverage:
 *   USGS GNIS "Populated Places" by state (public domain).
 *   https://www.usgs.gov/u.s.-board-on-geographic-names/download-gnis-data
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── env.local loader (same convention as bulk-discover.mjs) ───────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

// ── arg parsing ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const opts = { state: null, csv: null, dryRun: false };
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--state") opts.state = args[++i];
  else if (args[i] === "--csv") opts.csv = args[++i];
  else if (args[i] === "--dry-run") opts.dryRun = true;
  else {
    console.error(`Unknown arg: ${args[i]}`);
    process.exit(2);
  }
}

if (!opts.state || !opts.csv) {
  console.error("Usage: node scripts/seed-towns.mjs --state <ABBR> --csv <path> [--dry-run]");
  process.exit(2);
}

opts.state = opts.state.toUpperCase();
if (!/^[A-Z]{2}$/.test(opts.state)) {
  console.error(`Invalid state abbr: "${opts.state}" (expected two letters, e.g. NY)`);
  process.exit(2);
}

// ── Supabase ──────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// ── Helpers ───────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCsvLine(line) {
  // Minimal CSV parser — handles double-quoted fields with embedded commas.
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cur += c; }
    } else {
      if (c === '"') { inQuotes = true; }
      else if (c === ",") { out.push(cur); cur = ""; }
      else { cur += c; }
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map(parseCsvLine);
  return { header, rows };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = path.resolve(opts.csv);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  const { header, rows } = parseCsv(raw);
  const nameIdx = header.indexOf("name");
  const countyIdx = header.indexOf("county");
  if (nameIdx === -1) {
    console.error(`CSV header must include "name" (got: ${header.join(", ")})`);
    process.exit(1);
  }

  const seen = new Set();
  const records = [];
  const skipped = [];
  for (const row of rows) {
    const name = (row[nameIdx] ?? "").trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) { skipped.push({ name, reason: "empty slug" }); continue; }
    if (seen.has(slug)) { skipped.push({ name, reason: `duplicate slug ${slug}` }); continue; }
    seen.add(slug);
    const county = countyIdx >= 0 ? (row[countyIdx] ?? "").trim() || null : null;
    records.push({ name, slug, county, state: opts.state });
  }

  console.log(`Parsed ${records.length} unique towns from ${csvPath} for state ${opts.state}`);
  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} rows (first 5):`, skipped.slice(0, 5));
  }

  if (opts.dryRun) {
    console.log("Dry run — no DB writes. Sample records:", records.slice(0, 5));
    process.exit(0);
  }

  // Upsert in batches so Supabase doesn't choke on a huge payload.
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const chunk = records.slice(i, i + BATCH);
    const { error, count } = await supabase
      .from("towns")
      .upsert(chunk, { onConflict: "state,slug", count: "exact", ignoreDuplicates: false });
    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error);
      process.exit(1);
    }
    inserted += count ?? chunk.length;
    process.stdout.write(`  ${Math.min(i + BATCH, records.length)} / ${records.length}\r`);
  }
  console.log(`\nUpserted ${inserted} rows into towns (state=${opts.state}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
