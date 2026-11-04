import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

/** Shared threat intelligence data service — one source of truth for the
 *  globe, the live feed, the War Room widget and the targeted panel. */

export type ThreatRow = Database['public']['Tables']['threat_indicators']['Row'];
export type IncidentRow = Database['public']['Tables']['incidents']['Row'];
export type SecurityTeamRow = Database['public']['Tables']['security_teams']['Row'];
export type IncidentNoteRow = Database['public']['Tables']['incident_notes']['Row'];
export type IncidentActivityRow = Database['public']['Tables']['incident_activity']['Row'];
export type SyncLogRow = Database['public']['Tables']['intelligence_sync_logs']['Row'];

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational' | 'Unknown';

export const SEVERITY_COLORS: Record<Severity, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#facc15',
  Low: '#22c55e',
  Informational: '#3b82f6',
  Unknown: '#94a3b8',
};

export const SEVERITIES: Severity[] = ['Critical', 'High', 'Medium', 'Low', 'Informational', 'Unknown'];

/** Accurate labels — these are intelligence indicators, not live attack events. */
export const THREAT_TYPE_LABELS: Record<string, string> = {
  'malicious-ip': 'Reported Malicious IP',
  'malicious-url': 'Malicious URL',
  'malicious-domain': 'Malicious Domain',
  'malware-hash': 'Malware Indicator',
  'c2-server': 'Command & Control Server',
};

export const NOT_AVAILABLE = 'Not Available';

export const notAvail = (v: string | number | null | undefined): string =>
  v === null || v === undefined || v === '' ? NOT_AVAILABLE : String(v);

export const incidentStatuses = [
  'New', 'Under Investigation', 'Assigned', 'Contained', 'Mitigated', 'Resolved', 'Closed',
] as const;

export interface SyncResult {
  synced_at: string;
  providers: Array<{ provider: string; status: string; imported: number; message: string }>;
  total_imported: number;
}

/** Invoke the backend sync (imports real indicators from the providers). */
export async function runThreatSync(): Promise<SyncResult> {
  const { data, error } = await supabase.functions.invoke('threat-sync');
  if (error) throw new Error(error.message || 'Sync failed');
  return data as SyncResult;
}

/** Fetch the most recent indicators, newest first. */
export async function fetchThreats(limit = 500): Promise<ThreatRow[]> {
  const { data, error } = await supabase
    .from('threat_indicators')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ThreatRow[];
}

export async function fetchIncidents(): Promise<IncidentRow[]> {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as IncidentRow[];
}

export async function fetchSecurityTeams(): Promise<SecurityTeamRow[]> {
  const { data, error } = await supabase.from('security_teams').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as SecurityTeamRow[];
}

export async function fetchSyncLogs(limit = 30): Promise<SyncLogRow[]> {
  const { data, error } = await supabase
    .from('intelligence_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SyncLogRow[];
}

export async function fetchIncidentNotes(incidentId: string): Promise<IncidentNoteRow[]> {
  const { data, error } = await supabase
    .from('incident_notes')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as IncidentNoteRow[];
}

export async function fetchIncidentActivity(incidentId: string): Promise<IncidentActivityRow[]> {
  const { data, error } = await supabase
    .from('incident_activity')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as IncidentActivityRow[];
}

/** Flag / unflag a threat. Persisted in threat_flags + threat_indicators. */
export async function flagThreat(threatId: string, reason?: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('toggle_threat_flag', { _threat_id: threatId, _reason: reason ?? null });
  if (error) throw error;
  return data as boolean;
}

export async function createIncident(input: {
  threat_id: string;
  title: string;
  description?: string;
  severity?: string;
  team_id?: string | null;
}, userId: string): Promise<IncidentRow> {
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      threat_id: input.threat_id,
      title: input.title,
      description: input.description ?? null,
      severity: input.severity ?? 'Unknown',
      status: 'New',
      team_id: input.team_id ?? null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  await supabase.from('incident_activity').insert({
    incident_id: data.id,
    actor_id: userId,
    action: 'created',
    details: { title: input.title, severity: input.severity ?? 'Unknown' },
  });
  // link the indicator back to its incident (server-side RPC — the
  // threat_indicators table itself is SELECT-only for end users)
  const { error: linkError } = await supabase.rpc('link_threat_incident', {
    _threat_id: input.threat_id,
    _incident_id: data.id,
  });
  if (linkError) throw linkError;
  return data as IncidentRow;
}

export async function updateIncident(
  incident: IncidentRow,
  patch: Partial<Pick<IncidentRow, 'status' | 'team_id' | 'assigned_analyst' | 'severity'>>,
  userId: string,
): Promise<void> {
  const { error } = await supabase.from('incidents').update(patch).eq('id', incident.id);
  if (error) throw error;
  const changes = Object.entries(patch)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ({ field: k, value: v }));
  await supabase.from('incident_activity').insert({
    incident_id: incident.id,
    actor_id: userId,
    action: 'updated',
    details: { changes },
  });
}

export async function addIncidentNote(incidentId: string, note: string, userId: string): Promise<void> {
  const { error } = await supabase.from('incident_notes').insert({
    incident_id: incidentId,
    author_id: userId,
    note,
  });
  if (error) throw error;
  await supabase.from('incident_activity').insert({
    incident_id: incidentId,
    actor_id: userId,
    action: 'note_added',
    details: { note_length: note.length },
  });
}
