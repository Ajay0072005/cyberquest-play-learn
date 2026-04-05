import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const categoryFilter = category && category !== "all" ? ` focusing on ${category}` : "";

    const today = new Date().toISOString().split("T")[0];

    const prompt = `List upcoming and recent cybersecurity events happening in Tamil Nadu, India${categoryFilter}. Today's date is ${today}.

Include: hackathons, Capture The Flag (CTF) competitions, cybersecurity seminars, workshops, conferences, community meetups, and training programs.

Focus on events from well-known organizations: Anna University, IIT Madras, VIT, SRM, CDAC, ISACA Chennai, OWASP Chennai, IEEE chapters, etc.

Return ONLY a valid JSON array of event objects. Each object must have these fields:
- "title": string (event name)
- "date": string (date or date range, e.g. "April 15, 2026" or "April 15-17, 2026")  
- "location": string (venue and city)
- "type": string (one of: "hackathon", "ctf", "seminar", "workshop", "conference", "meetup", "training")
- "organizer": string (who is organizing)
- "description": string (2-3 sentence description)
- "url": string (ONLY use real, verified homepage URLs of the organizing institution like "https://www.iitm.ac.in" or "https://www.vit.ac.in". If you are not 100% sure the URL exists, use an empty string "". NEVER make up or guess specific event page URLs.)
- "is_free": boolean
- "status": string (one of: "upcoming", "ongoing", "completed")

Return 8-15 events. For recurring events, estimate dates based on their usual schedule. Respond with ONLY the JSON array, no markdown formatting.`;

    const response = await fetch(
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
              content:
                "You are a cybersecurity events researcher. Return only valid JSON arrays. No markdown code blocks. Search for real, current events.",
            },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add funds in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Clean markdown code blocks if present
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

    return new Response(JSON.stringify({ events }), {
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
