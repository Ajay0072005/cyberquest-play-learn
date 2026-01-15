import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 10000;
const VALID_ROLES = ["user", "assistant", "system"];

interface ChatMessage {
  role: string;
  content: string;
}

function validateMessages(messages: unknown): { valid: boolean; error?: string } {
  // Check if messages is an array
  if (!Array.isArray(messages) || messages.length === 0) {
    return { valid: false, error: "Invalid messages format: must be a non-empty array" };
  }

  // Check message count limit
  if (messages.length > MAX_MESSAGES) {
    return { valid: false, error: `Too many messages in conversation (max ${MAX_MESSAGES})` };
  }

  // Validate each message
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    
    // Check message structure
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: `Invalid message at index ${i}: must be an object` };
    }

    // Validate role
    if (!msg.role || !VALID_ROLES.includes(msg.role)) {
      return { valid: false, error: `Invalid message role at index ${i}: must be one of ${VALID_ROLES.join(", ")}` };
    }

    // Validate content type
    if (typeof msg.content !== "string") {
      return { valid: false, error: `Invalid message content at index ${i}: must be a string` };
    }

    // Validate content length
    if (msg.content.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message at index ${i} is too long (max ${MAX_MESSAGE_LENGTH} characters)` };
    }
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's JWT to verify authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    
    // Validate messages input
    const validation = validateMessages(messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create service client for RAG operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the last user message for RAG
    const lastUserMessage = (messages as ChatMessage[]).filter((m) => m.role === "user").pop()?.content || "";

    // Generate embedding for context retrieval
    let context = "";
    try {
      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: lastUserMessage,
          model: "text-embedding-3-small",
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        const { data: similarQuestions } = await supabase.rpc("match_knowledge", {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: 3,
        });

        if (similarQuestions?.length) {
          context = similarQuestions
            .map((q: { prompt: string; category: string }) => `Q: ${q.prompt}\nCategory: ${q.category}`)
            .join("\n\n");
        }
      }
    } catch (e) {
      console.log("RAG context retrieval failed, continuing without context:", e);
    }

    const systemPrompt = `You are CyberBot, a friendly cybersecurity expert assistant for CyberQuest - an educational platform teaching cybersecurity through interactive challenges.

Your capabilities:
- Answer questions about cybersecurity concepts, tools, and techniques
- Help users with the platform's challenges (SQL injection, cryptography, terminal commands)
- Provide educational guidance on ethical hacking and security best practices
- Explain vulnerabilities and defensive countermeasures

Guidelines:
1. Be friendly, encouraging, and educational
2. When discussing exploits or attacks, always emphasize ethical use and legal boundaries
3. Suggest defensive measures alongside offensive techniques
4. If asked about challenges, give hints rather than direct answers to maintain the learning experience
5. Keep responses concise but informative

${context ? `Relevant knowledge from our database:\n${context}\n\nUse this context when relevant to provide accurate answers.` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
