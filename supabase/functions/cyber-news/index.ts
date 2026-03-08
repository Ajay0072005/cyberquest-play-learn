const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

function extractTag(xml: string, tag: string): string {
  const openVariants = [`<${tag}>`, `<${tag} `];
  let startIdx = -1;
  for (const open of openVariants) {
    startIdx = xml.indexOf(open);
    if (startIdx !== -1) {
      startIdx = xml.indexOf('>', startIdx) + 1;
      break;
    }
  }
  if (startIdx === -1) return '';
  
  const endIdx = xml.indexOf(`</${tag}>`, startIdx);
  if (endIdx === -1) return '';
  
  let val = xml.substring(startIdx, endIdx).trim();
  // Strip CDATA
  if (val.startsWith('<![CDATA[')) {
    val = val.replace('<![CDATA[', '').replace(']]>', '');
  }
  return val.trim();
}

function parseRSS(xml: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];
  let pos = 0;
  while (true) {
    const itemStart = xml.indexOf('<item', pos);
    if (itemStart === -1) break;
    const itemEnd = xml.indexOf('</item>', itemStart);
    if (itemEnd === -1) break;
    const itemXml = xml.substring(itemStart, itemEnd + 7);
    
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description')
      .replace(/<[^>]*>/g, '')
      .substring(0, 300);
    const pubDate = extractTag(itemXml, 'pubDate');
    
    if (title && link) {
      items.push({ title, link, description, pubDate, source, category });
    }
    pos = itemEnd + 7;
  }
  return items;
}

function parseAtom(xml: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];
  let pos = 0;
  while (true) {
    const entryStart = xml.indexOf('<entry', pos);
    if (entryStart === -1) break;
    const entryEnd = xml.indexOf('</entry>', entryStart);
    if (entryEnd === -1) break;
    const entryXml = xml.substring(entryStart, entryEnd + 8);
    
    const title = extractTag(entryXml, 'title');
    // For Atom, link is in href attribute
    const linkMatch = entryXml.match(/href="([^"]+)"/);
    const link = linkMatch ? linkMatch[1] : '';
    const description = extractTag(entryXml, 'summary')
      .replace(/<[^>]*>/g, '')
      .substring(0, 300) || extractTag(entryXml, 'content').replace(/<[^>]*>/g, '').substring(0, 300);
    const pubDate = extractTag(entryXml, 'published') || extractTag(entryXml, 'updated');
    
    if (title && link) {
      items.push({ title, link, description, pubDate, source, category });
    }
    pos = entryEnd + 8;
  }
  return items;
}

const feeds = [
  { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News', category: 'general' },
  { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer', category: 'general' },
  { url: 'https://krebsonsecurity.com/feed/', source: 'Krebs on Security', category: 'breaches' },
  { url: 'https://www.darkreading.com/rss.xml', source: 'Dark Reading', category: 'general' },
  { url: 'https://threatpost.com/feed/', source: 'Threatpost', category: 'vulnerabilities' },
  { url: 'https://www.csoonline.com/feed/', source: 'CSO Online', category: 'general' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const allItems: NewsItem[] = [];

    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          
          const res = await fetch(feed.url, {
            headers: { 'User-Agent': 'CyberQuest-NewsBot/1.0' },
            signal: controller.signal,
          });
          clearTimeout(timeout);
          
          const text = await res.text();
          
          if (text.includes('<entry')) {
            return parseAtom(text, feed.source, feed.category);
          }
          return parseRSS(text, feed.source, feed.category);
        } catch (e) {
          console.warn(`Failed to fetch ${feed.source}:`, e);
          return [];
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    }

    // Sort by date, newest first
    allItems.sort((a, b) => {
      const da = new Date(a.pubDate).getTime() || 0;
      const db = new Date(b.pubDate).getTime() || 0;
      return db - da;
    });

    // Deduplicate by title similarity
    const seen = new Set<string>();
    const unique = allItems.filter(item => {
      const key = item.title.toLowerCase().substring(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return new Response(JSON.stringify({ success: true, articles: unique.slice(0, 50) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to fetch news' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
