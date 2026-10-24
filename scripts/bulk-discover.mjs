/**
 * Bulk business discovery script
 * Usage: node scripts/bulk-discover.mjs
 *
 * Loops every category × town, calls Claude Haiku to generate 5 businesses,
 * imports them directly into Supabase. Sleeps 15s between requests.
 * Progress is saved to scripts/progress.json so it can be resumed.
 *
 * Ctrl+C to pause — rerun the same command to resume from where it stopped.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load .env.local manually
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env.local");
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = path.join(__dirname, "progress.json");

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error("Missing env vars. Make sure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ANTHROPIC_API_KEY are set.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const DELAY_MS = 15_000;       // 15s between requests
const BUSINESSES_PER_COMBO = 5;

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function uniqueSlug(base) {
  // Use timestamp + random to guarantee uniqueness
  return `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  }
  return { done: [], imported: 0, skipped: 0 };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── Anthropic call ─────────────────────────────────────────────────────────

async function discoverBusinesses(categoryName, townName) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `List ${BUSINESSES_PER_COMBO} real businesses offering ${categoryName} in ${townName}, Connecticut relevant for families with kids. Use your knowledge of real local businesses. Return ONLY a valid JSON array — no other text, no markdown, no explanation. Each object must include: name, address, phone, website, email, description (2 sentences, parent-friendly tone), age_min, age_max, cost_description, is_free (boolean), facebook_url, instagram_url, hours (array of 7 objects with day_of_week 0–6, opens_at "HH:MM", closes_at "HH:MM", is_closed boolean).`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic error: ${err}`);
  }

  const data = await response.json();
  const textBlock = [...(data.content ?? [])].reverse().find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text in response");

  let raw = textBlock.text.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found in response");
    return JSON.parse(match[0]);
  }
}

// ── Logo fetching ─────────────────────────────────────────────────────────

async function fetchLogoUrl(websiteUrl) {
  if (!websiteUrl) return null;
  try {
    const base = new URL(websiteUrl);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MyConnecticutKids/1.0)" },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const html = await res.text();

    // 1. og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch) return resolveUrl(ogMatch[1], base);

    // 2. apple-touch-icon
    const appleMatch = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i);
    if (appleMatch) return resolveUrl(appleMatch[1], base);

    // 3. large favicon (svg or 192+)
    const iconMatches = [...html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)];
    for (const m of iconMatches) {
      const href = m[1];
      if (href.endsWith(".svg") || href.includes("192") || href.includes("512")) {
        return resolveUrl(href, base);
      }
    }

    // 4. /favicon.ico fallback
    return `${base.origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function resolveUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

async function uploadLogoToSupabase(imageUrl, listingId) {
  if (!imageUrl) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MyConnecticutKids/1.0)" },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "image/png";

    // Only accept images
    if (!contentType.startsWith("image/")) return null;

    const ext = contentType.includes("svg") ? "svg"
      : contentType.includes("webp") ? "webp"
      : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg"
      : "png";

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 100) return null; // skip tiny/empty files

    const filePath = `listings/${listingId}/logo.${ext}`;
    const { error } = await supabase.storage
      .from("listing-images")
      .upload(filePath, buffer, { contentType, upsert: true });

    if (error) return null;

    const { data: { publicUrl } } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch {
    return null;
  }
}

// ── Import into Supabase ───────────────────────────────────────────────────

async function importBusiness(business, townName, categoryId) {
  const slug = uniqueSlug(slugify(business.name || "business"));

  let description = business.description ?? "";
  const socials = [];
  if (business.facebook_url) socials.push(`Facebook: ${business.facebook_url}`);
  if (business.instagram_url) socials.push(`Instagram: ${business.instagram_url}`);
  if (socials.length > 0) description += `\n\n${socials.join(" · ")}`;

  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .insert({
      name: business.name,
      slug,
      description: description || null,
      short_desc: business.description ? business.description.slice(0, 160) : null,
      town: townName,
      address: business.address ?? null,
      phone: business.phone ?? null,
      website: business.website ?? null,
      email: business.email ?? null,
      age_min: business.age_min ?? null,
      age_max: business.age_max ?? null,
      cost_description: business.cost_description ?? null,
      is_free: business.is_free ?? false,
      status: "approved",
      is_featured: false,
      owner_id: null,
    })
    .select("id")
    .single();

  if (listingErr) throw new Error(listingErr.message);

  const listingId = listing.id;

  await supabase.from("listing_categories").insert({ listing_id: listingId, category_id: categoryId });

  const hoursPayload = [];
  for (let day = 0; day <= 6; day++) {
    const h = (business.hours ?? []).find((x) => x.day_of_week === day);
    hoursPayload.push({
      listing_id: listingId,
      day_of_week: day,
      opens_at: h?.opens_at ?? null,
      closes_at: h?.closes_at ?? null,
      is_closed: h?.is_closed ?? true,
    });
  }
  await supabase.from("listing_hours").insert(hoursPayload);

  // Try to fetch and upload logo
  if (business.website) {
    const logoUrl = await fetchLogoUrl(business.website);
    if (logoUrl) {
      const publicUrl = await uploadLogoToSupabase(logoUrl, listingId);
      if (publicUrl) {
        await supabase.from("listing_images").insert({
          listing_id: listingId,
          url: publicUrl,
          is_primary: true,
          sort_order: 0,
        });
      }
    }
  }

  return listingId;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Load categories and towns from DB
  const { data: categories } = await supabase.from("categories").select("id, name, slug").order("sort_order");
  const { data: towns } = await supabase.from("towns").select("id, name, slug").order("name");

  if (!categories?.length || !towns?.length) {
    console.error("No categories or towns found in DB.");
    process.exit(1);
  }

  const progress = loadProgress();
  const doneSet = new Set(progress.done);

  // Build full combo list
  const combos = [];
  for (const cat of categories) {
    for (const town of towns) {
      combos.push({ cat, town });
    }
  }

  const remaining = combos.filter((c) => !doneSet.has(`${c.cat.id}:${c.town.id}`));

  console.log(`\n📋 Total combos: ${combos.length}`);
  console.log(`✅ Already done: ${progress.done.length}`);
  console.log(`⏳ Remaining:    ${remaining.length}`);
  console.log(`📥 Imported so far: ${progress.imported}`);
  console.log(`⏭️  Skipped so far:  ${progress.skipped}`);
  console.log(`\nStarting in 3 seconds... (Ctrl+C to pause)\n`);
  await sleep(3000);

  for (let i = 0; i < remaining.length; i++) {
    const { cat, town } = remaining[i];
    const key = `${cat.id}:${town.id}`;
    const pct = (((progress.done.length + i + 1) / combos.length) * 100).toFixed(1);

    process.stdout.write(`[${pct}%] ${cat.name} in ${town.name}, CT ... `);

    try {
      const businesses = await discoverBusinesses(cat.name, town.name);
      let count = 0;

      for (const biz of businesses) {
        if (!biz.name) continue;
        try {
          await importBusiness(biz, town.name, cat.id);
          count++;
        } catch (e) {
          process.stdout.write(`\n  ⚠ skipped "${biz.name}": ${String(e).slice(0, 80)}`);
        }
      }

      progress.imported += count;
      console.log(`✓ ${count} imported`);
    } catch (e) {
      const msg = String(e);
      if (msg.includes("rate_limit")) {
        console.log(`⏸  Rate limited — waiting 60s...`);
        await sleep(60_000);
        i--; // retry this combo
        continue;
      }
      console.log(`✗ Error: ${msg.slice(0, 80)}`);
      progress.skipped++;
    }

    progress.done.push(key);
    saveProgress(progress);

    if (i < remaining.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n🎉 Done! ${progress.imported} listings imported, ${progress.skipped} combos skipped.`);
  console.log(`Progress saved to ${PROGRESS_FILE}`);
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
