// Pure simulation data for the Threat Globe (no React / three imports).
export type AttackType = 'DDoS' | 'Malware' | 'Phishing' | 'Exploit';

export interface City { name: string; country: string; lat: number; lon: number }

export const CITIES: City[] = [
  { name: 'New York', country: 'US', lat: 40.7, lon: -74 },
  { name: 'San Francisco', country: 'US', lat: 37.8, lon: -122.4 },
  { name: 'São Paulo', country: 'BR', lat: -23.5, lon: -46.6 },
  { name: 'London', country: 'GB', lat: 51.5, lon: -0.1 },
  { name: 'Frankfurt', country: 'DE', lat: 50.1, lon: 8.7 },
  { name: 'Moscow', country: 'RU', lat: 55.8, lon: 37.6 },
  { name: 'Lagos', country: 'NG', lat: 6.5, lon: 3.4 },
  { name: 'Dubai', country: 'AE', lat: 25.2, lon: 55.3 },
  { name: 'Mumbai', country: 'IN', lat: 19.1, lon: 72.9 },
  { name: 'Bengaluru', country: 'IN', lat: 12.97, lon: 77.6 },
  { name: 'Singapore', country: 'SG', lat: 1.35, lon: 103.8 },
  { name: 'Beijing', country: 'CN', lat: 39.9, lon: 116.4 },
  { name: 'Tokyo', country: 'JP', lat: 35.7, lon: 139.7 },
  { name: 'Seoul', country: 'KR', lat: 37.6, lon: 127 },
  { name: 'Sydney', country: 'AU', lat: -33.9, lon: 151.2 },
  { name: 'Johannesburg', country: 'ZA', lat: -26.2, lon: 28 },
  { name: 'Toronto', country: 'CA', lat: 43.7, lon: -79.4 },
  { name: 'Mexico City', country: 'MX', lat: 19.4, lon: -99.1 },
];

export const ATTACK_INFO: Record<AttackType, { color: string; ports: string[]; lab: { label: string; path: string }; blurb: string }> = {
  DDoS: { color: '#f97316', ports: ['80/HTTP', '443/HTTPS', '53/DNS'], lab: { label: 'Practical Labs', path: '/labs' }, blurb: 'Floods a target with traffic to knock services offline.' },
  Malware: { color: '#ef4444', ports: ['445/SMB', '3389/RDP', '135/RPC'], lab: { label: 'Terminal Challenge', path: '/terminal' }, blurb: 'Malicious payloads like ransomware spreading across exposed services.' },
  Phishing: { color: '#38bdf8', ports: ['25/SMTP', '587/SMTP', '443/HTTPS'], lab: { label: 'Practical Labs', path: '/labs' }, blurb: 'Deceptive emails and pages that steal credentials.' },
  Exploit: { color: '#a3e635', ports: ['22/SSH', '3306/MySQL', '8080/HTTP'], lab: { label: 'SQL Injection Game', path: '/sql-game' }, blurb: 'Abuses software flaws such as SQL injection or unpatched CVEs.' },
};

export const ATTACK_TYPES = Object.keys(ATTACK_INFO) as AttackType[];

export interface Attack {
  id: number; type: AttackType; from: City; to: City; port: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical'; time: Date;
}

let nextId = 1;
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const SEV: Attack['severity'][] = ['Low', 'Medium', 'Medium', 'High', 'High', 'Critical'];

export function spawnAttack(allowed: AttackType[]): Attack | null {
  if (!allowed.length) return null;
  const from = pick(CITIES);
  let to = pick(CITIES);
  while (to === from) to = pick(CITIES);
  const type = pick(allowed);
  return { id: nextId++, type, from, to, port: pick(ATTACK_INFO[type].ports), severity: pick(SEV), time: new Date() };
}
