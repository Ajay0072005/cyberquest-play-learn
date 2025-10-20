import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate embedding for user query
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: message,
        model: 'text-embedding-3-small'
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate query embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search for similar questions using vector similarity
    const { data: similarQuestions, error: searchError } = await supabase.rpc(
      'match_knowledge',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5
      }
    );

    // If RPC doesn't exist yet, use a direct query
    let context = '';
    if (searchError) {
      console.log('RPC not found, using direct query');
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('prompt, category')
        .limit(5);
      
      if (!error && data) {
        context = data.map(q => `Q: ${q.prompt}\nCategory: ${q.category}`).join('\n\n');
      }
    } else {
      context = similarQuestions
        ?.map((q: any) => `Q: ${q.prompt}\nCategory: ${q.category}`)
        .join('\n\n') || '';
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
          { role: 'user', content: message }
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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});