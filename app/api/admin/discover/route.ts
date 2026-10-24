import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  // Verify admin session
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { category, town } = await req.json();
  if (!category || !town) {
    return NextResponse.json({ error: "category and town required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `List 5 real businesses offering ${category} in ${town}, Connecticut that are relevant for families with kids. Use your knowledge of real local businesses. Return ONLY a valid JSON array — no other text, no markdown, no explanation. Each object must include: name, address, phone, website, email, description (2 sentences, parent-friendly tone), age_min, age_max, cost_description, is_free (boolean), facebook_url, instagram_url, hours (array of 7 objects with day_of_week 0–6, opens_at "HH:MM", closes_at "HH:MM", is_closed boolean).`,
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: `Anthropic error: ${err}` }, { status: 500 });
  }

  const data = await response.json();

  // Find the last text content block
  const textBlock = [...(data.content ?? [])].reverse().find(
    (b: { type: string }) => b.type === "text"
  ) as { type: string; text: string } | undefined;

  if (!textBlock) {
    return NextResponse.json({ error: "No text in response" }, { status: 500 });
  }

  let raw = textBlock.text.trim();

  // Strip markdown fences
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let businesses: unknown[];
  try {
    // First try direct parse
    const parsed = JSON.parse(raw);
    businesses = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Fall back: extract the first JSON array found anywhere in the text
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ error: "No JSON array found in response", raw }, { status: 500 });
    }
    try {
      businesses = JSON.parse(match[0]);
      if (!Array.isArray(businesses)) throw new Error("not an array");
    } catch {
      return NextResponse.json({ error: "Failed to parse JSON from response", raw }, { status: 500 });
    }
  }

  return NextResponse.json({ businesses });
}
