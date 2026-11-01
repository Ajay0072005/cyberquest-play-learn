import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

/**
 * threat-sync — imports real threat intelligence into public.threat_indicators.
 *
 * Sources:
 *  - ThreatFox (abuse.ch): keyless, recent IOCs (IPs, domains, URLs, hashes)
 *  - URLhaus (abuse.ch): keyless, recent malicious URLs
 *  - AlienVault OTX: requires OTX_API_KEY secret; reported as "requires-configuration" otherwise
 *  - AbuseIPDB: requires ABUSEIPDB_API_KEY secret; reported as "requires-configuration" otherwise
 *
 * This is threat INTELLIGENCE (reported/historical malicious indicators), not a
 * live attack stream. Severity is derived from the provider's confidence score;
 * when a provider publishes no confidence the severity stays "Unknown".
 * Geographic coordinates come from IP geolocation of the reported malicious IP
 * (with a cache). Coordinates are only stored when a lookup succeeds — none are
 * invented, so attack arcs exist only for records that genuinely carry both a
 * source and a destination position.
 */

type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational' | 'Unknown';

interface NormalizedThreat {
  provider: string;
  provider_event_id: string;
  threat_type: string;
  indicator_value: string;
  source_ip: string | null;
  dest_ip: string | null;
  dest_port: number | null;
  protocol: string | null;
  severity: Severity;
  confidence: number | null;
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  first_seen: string | null;
  last_seen: string | null;
  source_reference: string | null;
}

const GEO_MAX_LOOKUPS = 40; // per sync run — be gentle with the free geolocation API

function severityFromConfidence(confidence: number | null | undefined): Severity {
  if (confidence == null) return 'Unknown';
  if (confidence >= 95) return 'Critical';
  if (confidence >= 75) return 'High';
  if (confidence >= 50) return 'Medium';
  if (confidence > 0) return 'Low';
  return 'Unknown';
}

function toIso(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value.replace(' ', 'T').replace(/Z?$/, 'Z'));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ---------- ThreatFox (keyless) ----------
async function fetchThreatFox(): Promise<NormalizedThreat[]> {
  const body = await fetchJson('https://threatfox.abuse.ch/api/v1/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'get_iocs', days: 1 }),
  });
  if (body.query_status !== 'ok' || !Array.isArray(body.data)) {
    throw new Error(`ThreatFox query_status=${body.query_status}`);
  }
  return body.data.map((d: any) => {
    const iocType: string = String(d.ioc_type || '').toLowerCase();
    const threatType =
      iocType.includes('ip') ? 'malicious-ip'
      : iocType.includes('url') ? 'malicious-url'
      : iocType.includes('domain') ? 'malicious-domain'
      : 'malware-hash';
    // ip:port IOCs carry the listening port in the indicator value
    let sourceIp: string | null = null;
    let port: number | null = null;
    if (iocType.includes('ip:port') || (iocType.includes('ip') && String(d.ioc).includes(':'))) {
      const [ip, p] = String(d.ioc).split(':');
      sourceIp = ip || null;
      port = p && /^\d+$/.test(p) ? Number(p) : null;
    } else if (iocType.includes('ip')) {
      sourceIp = String(d.ioc);
    }
    const confidence = typeof d.confidence === 'number' ? d.confidence : null;
    return {
      provider: 'ThreatFox',
      provider_event_id: String(d.id),
      threat_type: threatType,
      indicator_value: String(d.ioc ?? ''),
      source_ip: sourceIp,
      dest_ip: null, // ThreatFox does not publish victim/destination addresses
      dest_port: port,
      protocol: null,
      severity: severityFromConfidence(confidence),
      confidence,
      country: null,
      city: null,
      latitude: null,
      longitude: null,
      first_seen: toIso(d.first_seen_utc),
      last_seen: toIso(d.last_seen_utc),
      source_reference: typeof d.ref === 'string' && d.ref ? d.ref : null,
    };
  }).filter((t: NormalizedThreat) => t.indicator_value);
}

// ---------- URLhaus (keyless) ----------
async function fetchURLhaus(): Promise<NormalizedThreat[]> {
  const data = await fetchJson('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/100/', {
    method: 'POST',
  });
  if (!Array.isArray(data)) throw new Error('URLhaus returned no array');
  return data.map((d: any) => {
    const confidence: number | null = null; // URLhaus publishes no confidence score
    return {
      provider: 'URLhaus',
      provider_event_id: String(d.id),
      threat_type: 'malicious-url',
      indicator_value: String(d.url ?? ''),
      source_ip: null,
      dest_ip: null,
      dest_port: null,
      protocol: null,
      severity: severityFromConfidence(confidence),
      confidence,
      country: null,
      city: null,
      latitude: null,
      longitude: null,
      first_seen: toIso(d.date_added),
      last_seen: toIso(d.date_added),
      source_reference: `https://urlhaus.abuse.ch/browse.php?search=${encodeURIComponent(String(d.url ?? ''))}`,
    };
  }).filter((t: NormalizedThreat) => t.indicator_value);
}

// ---------- AlienVault OTX (requires OTX_API_KEY) ----------
async function fetchOTX(apiKey: string): Promise<NormalizedThreat[]> {
  const since = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
  const body = await fetchJson(
    `https://otx.alienvault.com/api/v1/pulses/subscribed?limit=10&modified_since=${since}`,
    { headers: { 'X-OTX-API-KEY': apiKey } },
  );
  const pulses: any[] = Array.isArray(body?.results) ? body.results : [];
  const out: NormalizedThreat[] = [];
  for (const p of pulses) {
    const indicators: any[] = [
      ...(p.indicators ?? []).filter((i: any) => i.type === 'IPv4').slice(0, 10),
    ];
    for (const i of indicators) {
      out.push({
        provider: 'OTX',
        provider_event_id: `${p.id}:${i.id ?? i.indicator}`,
        threat_type: 'malicious-ip',
        indicator_value: String(i.indicator),
        source_ip: String(i.indicator),
        dest_ip: null,
        dest_port: null,
        protocol: null,
        severity: 'Unknown', // pulses publish no confidence-derived severity
        confidence: null,
        country: null,
        city: null,
        latitude: null,
        longitude: null,
        first_seen: toIso(i.created) ?? toIso(p.created),
        last_seen: toIso(p.modified),
        source_reference: `https://otx.alienvault.com/pulse/${p.id}`,
      });
    }
  }
  return out;
}

// ---------- AbuseIPDB (requires ABUSEIPDB_API_KEY) ----------
async function fetchAbuseIPDB(apiKey: string): Promise<NormalizedThreat[]> {
  const body = await fetchJson(
    'https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90&limit=100',
    { headers: { Key: apiKey, Accept: 'application/json' } },
  );
  const rows: any[] = Array.isArray(body?.data) ? body.data : [];
  return rows.map((d: any) => {
    const confidence = typeof d.abuseConfidenceScore === 'number' ? d.abuseConfidenceScore : null;
    return {
      provider: 'AbuseIPDB',
      provider_event_id: String(d.ipAddress),
      threat_type: 'malicious-ip',
      indicator_value: String(d.ipAddress),
      source_ip: String(d.ipAddress),
      dest_ip: null,
      dest_port: null,
      protocol: null,
      severity: severityFromConfidence(confidence),
      confidence,
      country: null,
      city: null,
      latitude: null,
      longitude: null,
      first_seen: null,
      last_seen: new Date().toISOString(),
      source_reference: `https://www.abuseipdb.com/check/${encodeURIComponent(String(d.ipAddress))}`,
    };
  });
}

// ---------- IP geolocation with cache ----------
async function enrichGeo(
  supabaseAdmin: any,
  threats: NormalizedThreat[],
): Promise<number> {
  const ips = [...new Set(threats.map((t) => t.source_ip).filter((ip): ip is string => !!ip))];
  if (!ips.length) return 0;
  const lookup = ips.slice(0, GEO_MAX_LOOKUPS);
  const cached = await supabaseAdmin.from('threat_geo_cache').select('*').in('ip', lookup);
  const cacheMap = new Map<string, any>((cached.data ?? []).map((r: any) => [r.ip, r]));
  const missing = lookup.filter((ip) => !cacheMap.has(ip));

  for (const ip of missing) {
    try {
      const g = await fetchJson(`https://ipwho.is/${encodeURIComponent(ip)}`);
      if (g && g.success !== false && typeof g.latitude === 'number') {
        const row = {
          ip,
          country: g.country_code ?? null,
          city: g.city ?? null,
          latitude: g.latitude,
          longitude: g.longitude,
        };
        await supabaseAdmin.from('threat_geo_cache').upsert(row, { onConflict: 'ip' });
        cacheMap.set(ip, row);
      }
      await new Promise((r) => setTimeout(r, 250)); // stay well under the free tier rate limit
    } catch {
      // geo lookup failures are tolerated — the indicator stays honest ("Not Available")
    }
  }

  let enriched = 0;
  for (const t of threats) {
    if (!t.source_ip) continue;
    const g = cacheMap.get(t.source_ip);
    if (g && g.latitude != null) {
      t.country = g.country ?? null;
      t.city = g.city ?? null;
      t.latitude = g.latitude;
      t.longitude = g.longitude;
      enriched++;
    }
  }
  return enriched;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth: callers must present a valid Supabase JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const otxKey = Deno.env.get('OTX_API_KEY');
    const abuseKey = Deno.env.get('ABUSEIPDB_API_KEY');

    const sources: Array<{ provider: string; run: () => Promise<NormalizedThreat[]>; requiresConfig: boolean }> = [
      { provider: 'ThreatFox', run: fetchThreatFox, requiresConfig: false },
      { provider: 'URLhaus', run: fetchURLhaus, requiresConfig: false },
      { provider: 'OTX', run: () => (otxKey ? fetchOTX(otxKey) : Promise.resolve([])), requiresConfig: !otxKey },
      { provider: 'AbuseIPDB', run: () => (abuseKey ? fetchAbuseIPDB(abuseKey) : Promise.resolve([])), requiresConfig: !abuseKey },
    ];

    const results: Array<{ provider: string; status: string; imported: number; geo_enriched?: number; message: string }> = [];
    let totalImported = 0;

    for (const src of sources) {
      if (src.requiresConfig) {
        const message = 'Requires configuration: add the API key as a project secret to enable this provider.';
        await supabaseAdmin.from('intelligence_sync_logs').insert({ provider: src.provider, status: 'requires-configuration', records_imported: 0, message });
        results.push({ provider: src.provider, status: 'requires-configuration', imported: 0, message });
        continue;
      }
      try {
        const threats = await src.run();
        const geoEnriched = await enrichGeo(supabaseAdmin, threats);
        let imported = 0;
        if (threats.length) {
          const CHUNK = 200;
          for (let i = 0; i < threats.length; i += CHUNK) {
            const { data, error } = await supabaseAdmin
              .from('threat_indicators')
              .upsert(threats.slice(i, i + CHUNK), {
                onConflict: 'provider,provider_event_id',
                ignoreDuplicates: true,
              })
              .select('id');
            if (error) throw error;
            imported += data?.length ?? 0;
          }
        }
        await supabaseAdmin.from('intelligence_sync_logs').insert({
          provider: src.provider,
          status: 'ok',
          records_imported: imported,
          message: `Imported ${imported} new indicator(s) from ${threats.length} fetched; ${geoEnriched} geolocated.`,
        });
        results.push({ provider: src.provider, status: 'ok', imported, geo_enriched: geoEnriched, message: `Imported ${imported} new indicator(s)` });
        totalImported += imported;
      } catch (e) {
        const message = `Sync failed: ${e instanceof Error ? e.message : String(e)}`;
        await supabaseAdmin.from('intelligence_sync_logs').insert({ provider: src.provider, status: 'error', records_imported: 0, message });
        results.push({ provider: src.provider, status: 'error', imported: 0, message });
      }
    }

    return new Response(
      JSON.stringify({ synced_at: new Date().toISOString(), providers: results, total_imported: totalImported }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});
