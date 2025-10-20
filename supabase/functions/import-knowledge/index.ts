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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch CSV data from public folder
    const csvResponse = await fetch(`${supabaseUrl}/storage/v1/object/public/data/cysecbench.csv`);
    if (!csvResponse.ok) {
      // Try direct URL
      const directResponse = await fetch(new URL('/data/cysecbench.csv', req.url).href);
      if (!directResponse.ok) {
        throw new Error('Could not fetch CSV file');
      }
      const csvText = await directResponse.text();
      const lines = csvText.split('\n').slice(1); // Skip header
      
      let imported = 0;
      const batchSize = 50;
      
      for (let i = 0; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize).filter(line => line.trim());
        
        for (const line of batch) {
          const [prompt, category] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
          
          if (!prompt || !category) continue;
          
          // Generate embedding using Lovable AI
          const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: prompt,
              model: 'text-embedding-3-small'
            }),
          });
          
          if (!embeddingResponse.ok) {
            console.error('Failed to generate embedding:', await embeddingResponse.text());
            continue;
          }
          
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;
          
          // Insert into database
          const { error } = await supabase
            .from('knowledge_base')
            .insert({
              prompt,
              category,
              embedding
            });
          
          if (error) {
            console.error('Insert error:', error);
          } else {
            imported++;
          }
        }
        
        console.log(`Imported ${imported} entries so far...`);
      }
      
      return new Response(
        JSON.stringify({ success: true, imported }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const csvText = await csvResponse.text();
    const lines = csvText.split('\n').slice(1); // Skip header
    
    let imported = 0;
    const batchSize = 50;
    
    for (let i = 0; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize).filter(line => line.trim());
      
      for (const line of batch) {
        const [prompt, category] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        
        if (!prompt || !category) continue;
        
        // Generate embedding using Lovable AI
        const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: prompt,
            model: 'text-embedding-3-small'
          }),
        });
        
        if (!embeddingResponse.ok) {
          console.error('Failed to generate embedding:', await embeddingResponse.text());
          continue;
        }
        
        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;
        
        // Insert into database
        const { error } = await supabase
          .from('knowledge_base')
          .insert({
            prompt,
            category,
            embedding
          });
        
        if (error) {
          console.error('Insert error:', error);
        } else {
          imported++;
        }
      }
      
      console.log(`Imported ${imported} entries so far...`);
    }
    
    return new Response(
      JSON.stringify({ success: true, imported }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});