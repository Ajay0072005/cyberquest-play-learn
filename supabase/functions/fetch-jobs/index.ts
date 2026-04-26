const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const APP_ID = Deno.env.get('ADZUNA_APP_ID')
    const APP_KEY = Deno.env.get('ADZUNA_APP_KEY')
    if (!APP_ID || !APP_KEY) {
      throw new Error('Adzuna credentials not configured')
    }

    const url = new URL(req.url)
    const query = url.searchParams.get('query') || 'cyber security'
    const page = url.searchParams.get('page') || '1'
    const country = url.searchParams.get('country') || 'us'
    const resultsPerPage = url.searchParams.get('results_per_page') || '20'

    const adzunaUrl = `${ADZUNA_BASE}/${country}/search/${page}?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=${resultsPerPage}&what=${encodeURIComponent(query)}&content-type=application/json`

    const response = await fetch(adzunaUrl)
    if (!response.ok) {
      throw new Error(`Adzuna API error [${response.status}]: ${await response.text()}`)
    }

    const data = await response.json()

    // Transform Adzuna results to our format
    const jobs = (data.results || []).map((r: any, i: number) => ({
      id: r.id?.toString() || `adzuna-${i}`,
      title: r.title?.replace(/<\/?[^>]+(>|$)/g, '') || 'Untitled',
      company: r.company?.display_name || 'Unknown Company',
      location: r.location?.display_name || 'Unknown',
      type: detectJobType(r),
      remote: r.title?.toLowerCase().includes('remote') || r.description?.toLowerCase().includes('remote') ? 'Remote' : r.title?.toLowerCase().includes('hybrid') || r.description?.toLowerCase().includes('hybrid') ? 'Hybrid' : 'On-site',
      salary: r.salary_min && r.salary_max
        ? `$${Math.round(r.salary_min / 1000)}K – $${Math.round(r.salary_max / 1000)}K/yr`
        : r.salary_is_predicted === "1" && r.salary_min
          ? `~$${Math.round(r.salary_min / 1000)}K/yr (est.)`
          : null,
      postedAt: r.created ? getRelativeTime(r.created) : 'Recently',
      category: r.category?.label || 'Cybersecurity',
      level: guessLevel(r.title || '', r.description || ''),
      description: r.description?.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 500) || '',
      skills: extractSkills(r.title + ' ' + (r.description || '')),
      applyUrl: r.redirect_url || '#',
    }))

    return new Response(JSON.stringify({ jobs, total: data.count || 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('Error fetching jobs:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

function guessLevel(title: string, desc: string): string {
  const t = (title + ' ' + desc).toLowerCase()
  if (t.includes('intern') || t.includes('junior') || t.includes('entry') || t.includes('graduate')) return 'Entry'
  if (t.includes('lead') || t.includes('principal') || t.includes('staff') || t.includes('head of')) return 'Lead'
  if (t.includes('senior') || t.includes('sr.') || t.includes('sr ')) return 'Senior'
  if (t.includes('director') || t.includes('vp') || t.includes('chief') || t.includes('ciso') || t.includes('executive')) return 'Executive'
  return 'Mid'
}

function extractSkills(text: string): string[] {
  const skillKeywords = [
    'Python', 'AWS', 'Azure', 'GCP', 'SIEM', 'Splunk', 'Kubernetes', 'Docker',
    'Terraform', 'OSCP', 'CISSP', 'CEH', 'Nmap', 'Burp Suite', 'Metasploit',
    'Penetration Testing', 'SOC', 'NIST', 'ISO 27001', 'Risk Assessment',
    'Incident Response', 'Threat Intelligence', 'Malware Analysis', 'Firewall',
    'IDS/IPS', 'Encryption', 'IAM', 'Zero Trust', 'DevSecOps', 'CI/CD',
    'OWASP', 'API Security', 'Cloud Security', 'Network Security', 'Linux',
    'Active Directory', 'PowerShell', 'MITRE ATT&CK', 'Vulnerability Management',
    'Compliance', 'Red Team', 'Blue Team', 'SAST', 'DAST', 'Forensics',
  ]
  const lower = text.toLowerCase()
  return skillKeywords.filter(s => lower.includes(s.toLowerCase())).slice(0, 6)
}
