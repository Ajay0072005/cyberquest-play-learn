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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user's JWT and get their identity
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No user ID in token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client to check admin role (bypasses RLS for role check)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Error checking user permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User is authenticated and has admin role - proceed with import
    console.log(`Admin user ${userId} initiated knowledge import`);

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
          
          // Insert into database using admin client
          const { error } = await supabaseAdmin
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
        
        // Insert into database using admin client
        const { error } = await supabaseAdmin
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
