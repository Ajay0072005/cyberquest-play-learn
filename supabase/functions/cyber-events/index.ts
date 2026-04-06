import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EVENTBRITE_BASE = "https://www.eventbriteapi.com/v3";

// Eventbrite category IDs and subcategory mappings for cyber/tech
const SEARCH_KEYWORDS: Record<string, string> = {
  all: "cybersecurity",
  hackathon: "hackathon cybersecurity",
  ctf: "capture the flag CTF",
  seminar: "cybersecurity seminar",
  workshop: "cybersecurity workshop",
  conference: "cybersecurity conference",
  meetup: "cybersecurity meetup",
  training: "cybersecurity training",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json();
    const EVENTBRITE_API_KEY = Deno.env.get("EVENTBRITE_API_KEY");
    if (!EVENTBRITE_API_KEY) {
      throw new Error("EVENTBRITE_API_KEY is not configured");
    }

    const keyword = SEARCH_KEYWORDS[category] || SEARCH_KEYWORDS.all;

    // Search Eventbrite for cybersecurity events in Tamil Nadu
    const params = new URLSearchParams({
      q: keyword,
      "location.address": "Tamil Nadu, India",
      "location.within": "200km",
      expand: "venue,category,organizer",
      sort_by: "date",
    });

    const response = await fetch(`${EVENTBRITE_BASE}/events/search/?${params}`, {
      headers: {
        Authorization: `Bearer ${EVENTBRITE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Eventbrite API error:", response.status, errorText);

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid Eventbrite API key. Please check your credentials." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited by Eventbrite. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Eventbrite API error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const rawEvents = data.events || [];

    // Map Eventbrite events to our format
    const events = rawEvents.map((ev: any) => {
      const startDate = ev.start?.local
        ? new Date(ev.start.local).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "TBA";

      const endDate = ev.end?.local
        ? new Date(ev.end.local).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";

      const dateStr = endDate && endDate !== startDate ? `${startDate} - ${endDate}` : startDate;

      const venue = ev.venue;
      const location = venue
        ? [venue.name, venue.address?.city, venue.address?.region]
            .filter(Boolean)
            .join(", ")
        : ev.online_event
        ? "Online"
        : "TBA";

      // Guess event type from name/description
      const titleLower = (ev.name?.text || "").toLowerCase();
      const descLower = (ev.description?.text || "").toLowerCase();
      const combined = titleLower + " " + descLower;

      let type = "conference";
      if (combined.includes("hackathon")) type = "hackathon";
      else if (combined.includes("ctf") || combined.includes("capture the flag")) type = "ctf";
      else if (combined.includes("workshop")) type = "workshop";
      else if (combined.includes("seminar")) type = "seminar";
      else if (combined.includes("meetup") || combined.includes("meet-up")) type = "meetup";
      else if (combined.includes("training") || combined.includes("bootcamp")) type = "training";

      // Determine status
      const now = new Date();
      const start = ev.start?.utc ? new Date(ev.start.utc) : null;
      const end = ev.end?.utc ? new Date(ev.end.utc) : null;
      let status = "upcoming";
      if (start && end) {
        if (now > end) status = "completed";
        else if (now >= start && now <= end) status = "ongoing";
      }

      return {
        title: ev.name?.text || "Untitled Event",
        date: dateStr,
        location,
        type,
        organizer: ev.organizer?.name || "Unknown Organizer",
        description: ev.description?.text?.substring(0, 200) || "No description available.",
        url: ev.url || "",
        is_free: ev.is_free === true,
        status,
        logo_url: ev.logo?.url || null,
      };
    });

    return new Response(JSON.stringify({ events, total: data.pagination?.object_count || events.length }), {
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
