import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEARCH_QUERIES: Record<string, string> = {
  all: "cybersecurity events Tamil Nadu 2026",
  hackathon: "cybersecurity hackathon Tamil Nadu 2026",
  ctf: "capture the flag CTF competition Tamil Nadu 2026",
  seminar: "cybersecurity seminar Tamil Nadu 2026",
  workshop: "cybersecurity workshop Tamil Nadu 2026",
  conference: "cybersecurity conference Tamil Nadu 2026",
  meetup: "cybersecurity meetup Tamil Nadu 2026",
  training: "cybersecurity training bootcamp Tamil Nadu 2026",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication to prevent abuse of paid APIs
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { category } = await req.json();

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY is not configured");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const query = SEARCH_QUERIES[category] || SEARCH_QUERIES.all;

    // Step 1: Use Firecrawl to search for real events
    console.log("Searching Firecrawl for:", query);
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        limit: 10,
        lang: "en",
        country: "in",
        scrapeOptions: { formats: ["markdown"] },
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Firecrawl error:", searchResponse.status, errorText);

      if (searchResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Firecrawl credits exhausted. Please top up." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Firecrawl error [${searchResponse.status}]`);
    }

    const searchData = await searchResponse.json();
    const results = searchData.data || [];

    if (results.length === 0) {
      return new Response(JSON.stringify({ events: [], source: "firecrawl" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Build context from scraped results
    const scrapedContext = results
      .map((r: any, i: number) => {
        const content = r.markdown?.substring(0, 1500) || r.description || "";
        return `--- Source ${i + 1}: ${r.title || r.url} ---\nURL: ${r.url}\n${content}`;
      })
      .join("\n\n");

    // Step 3: Use AI to extract structured events from the scraped data
    const today = new Date().toISOString().split("T")[0];
    const prompt = `You are given real web search results about cybersecurity events in Tamil Nadu, India. Extract actual events from this data. Today's date is ${today}.

IMPORTANT RULES:
- ONLY extract events that are clearly mentioned in the source data below
- Do NOT invent or hallucinate any events
- If a source doesn't contain a clear event, skip it
- Use the actual URLs from the sources as the event URL
- If dates are unclear, mark them as "TBA"

Return a JSON array. Each object must have:
- "title": string (exact event name from the source)
- "date": string (e.g. "April 15, 2026" or "TBA")
- "location": string (venue/city from source, or "TBA")
- "type": string (one of: "hackathon", "ctf", "seminar", "workshop", "conference", "meetup", "training")
- "organizer": string (from source)
- "description": string (2-3 sentences from source content)
- "url": string (the actual source URL)
- "is_free": boolean (true if mentioned as free, false otherwise)
- "status": string ("upcoming", "ongoing", or "completed" based on dates vs today)

Source data:
${scrapedContext}

Return ONLY the JSON array. No markdown. If no real events found, return [].`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "You extract structured event data from web content. Return only valid JSON arrays. Never invent events not present in the source data.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let events;
    try {
      events = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", cleaned);
      events = [];
    }

    return new Response(JSON.stringify({ events, source: "firecrawl" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("cyber-events error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
