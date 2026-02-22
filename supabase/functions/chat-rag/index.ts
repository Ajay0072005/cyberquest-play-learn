import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_MESSAGE_LENGTH = 10000;

function validateMessage(message: unknown): { valid: boolean; error?: string } {
  if (typeof message !== 'string') {
    return { valid: false, error: 'Message must be a string' };
  }
  
  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Verify the user's JWT
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const { message } = body;
    
    const validation = validateMessage(message);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to generate embedding for vector search, fall back to text search
    let context = '';
    try {
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: message.trim(),
          model: 'text-embedding-3-small'
        }),
      });

      if (embeddingResponse.ok) {
        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

        const { data: similarQuestions, error: searchError } = await supabase.rpc(
          'match_knowledge',
          {
            query_embedding: queryEmbedding,
            match_threshold: 0.7,
            match_count: 5
          }
        );

        if (!searchError && similarQuestions) {
          context = similarQuestions
            .map((q: any) => `Q: ${q.prompt}\nCategory: ${q.category}`)
            .join('\n\n');
        }
      } else {
        console.log('Embedding API returned status:', embeddingResponse.status);
      }
    } catch (embErr) {
      console.log('Embedding/vector search failed, using fallback:', embErr);
    }

    // Fallback: use direct text search if no context from embeddings
    if (!context) {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('prompt, category')
        .ilike('prompt', `%${message.trim().split(' ').slice(0, 3).join('%')}%`)
        .limit(5);
      
      if (!error && data && data.length > 0) {
        context = data.map(q => `Q: ${q.prompt}\nCategory: ${q.category}`).join('\n\n');
      }
    }

    // Generate response using Lovable AI with RAG context
    const systemPrompt = `You are a cybersecurity expert assistant. You answer questions about cybersecurity based on the knowledge base provided.

IMPORTANT: This is an educational platform. If users ask about malicious activities or exploits:
1. Acknowledge it's from our educational dataset
2. Explain the concept for defensive purposes
3. Emphasize ethical use and legal boundaries
4. Suggest defensive countermeasures

Relevant knowledge from our database:
${context}

Use the above context to provide accurate, educational answers. If the question is not related to the context, provide general cybersecurity guidance.`;

    const chatResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() }
        ],
        stream: false
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Chat API error:', errorText);
      
      if (chatResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (chatResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('Failed to generate response');
    }

    const chatData = await chatResponse.json();
    const reply = chatData.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat RAG error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});