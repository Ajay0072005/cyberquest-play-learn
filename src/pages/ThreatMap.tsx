import { lazy, Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe2, RotateCw, RefreshCw, X, ArrowRight, Flag, ShieldAlert, Database, Loader2 } from 'lucide-react';
import { useAdminRole } from '@/hooks/useAdminRole';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useThreatIntel } from '@/hooks/useThreatIntel';
import {
  ThreatRow, Severity, SEVERITY_COLORS, SEVERITIES, THREAT_TYPE_LABELS,
  notAvail, flagThreat, createIncident, updateIncident, addIncidentNote,
  fetchIncidentNotes, fetchIncidentActivity, IncidentRow, IncidentNoteRow, IncidentActivityRow,
} from '@/services/threatIntel';

const ThreatGlobe = lazy(() => import('@/components/threatmap/ThreatGlobe'));

type GlobeMode = 'all' | 'active-incidents' | 'flagged' | 'critical' | 'resolved';

const GLOBE_MODES: { value: GlobeMode; label: string }[] = [
  { value: 'all', label: 'All Intelligence' },
  { value: 'active-incidents', label: 'Active Incidents' },
  { value: 'flagged', label: 'Flagged Threats' },
  { value: 'critical', label: 'Critical Threats' },
  { value: 'resolved', label: 'Resolved Incidents' },
];

/** Compact field: shows the value or "Not Available" — never invents data. */
const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3 text-[11px]">
    <span className="text-muted-foreground flex-shrink-0">{label}</span>
    <span className="text-right font-mono text-foreground break-all">{value}</span>
  </div>
);

const ThreatMap: React.FC = () => {
  const [rotate, setRotate] = useState(true);
  const [selected, setSelected] = useState<ThreatRow | null>(null);
  const [globeMode, setGlobeMode] = useState<GlobeMode>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [flagBusy, setFlagBusy] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [creating, setCreating] = useState(false);
  const [notes, setNotes] = useState<IncidentNoteRow[]>([]);
  const [activity, setActivity] = useState<IncidentActivityRow[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const { threats, incidents, teams, loading, syncing, lastSyncAt, providerStatus, user, sync, refetch } = useThreatIntel();

  const filtered = useMemo(() => threats.filter((t) => {
    if (severityFilter !== 'all' && t.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && t.threat_type !== typeFilter) return false;
    if (countryFilter !== 'all' && (t.country ?? '') !== countryFilter) return false;
    if (providerFilter !== 'all' && t.provider !== providerFilter) return false;
    return true;
  }), [threats, severityFilter, typeFilter, countryFilter, providerFilter]);

  const globeThreats = useMemo(() => {
    const incidentById = new Map(incidents.map((i) => [i.id, i]));
    switch (globeMode) {
      case 'active-incidents':
        return filtered.filter((t) => t.incident_id && !['Resolved', 'Closed'].includes(incidentById.get(t.incident_id)?.status ?? ''));
      case 'flagged':
        return filtered.filter((t) => t.is_flagged);
      case 'critical':
        return filtered.filter((t) => t.severity === 'Critical' || t.severity === 'High');
      case 'resolved':
        return filtered.filter((t) => t.incident_id && ['Resolved', 'Closed'].includes(incidentById.get(t.incident_id)?.status ?? ''));
      default:
        return filtered;
    }
  }, [filtered, globeMode, incidents]);

  const markerCount = globeThreats.filter((t) => t.latitude != null).length;

  /** Most targeted — database-derived, only records with usable geo info.
   *  These are reported malicious source locations (intelligence indicators),
   *  not observed attack destinations. */
  const targeted = useMemo(() => {
    const c: Record<string, number> = {};
    globeThreats.forEach((t) => {
      if (t.country) c[t.country] = (c[t.country] || 0) + 1;
    });
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [globeThreats]);

  const countries = useMemo(
    () => [...new Set(threats.map((t) => t.country).filter((c): c is string => !!c))].sort(),
    [threats],
  );
  const providers = useMemo(() => [...new Set(threats.map((t) => t.provider))].sort(), [threats]);
  const types = useMemo(() => [...new Set(threats.map((t) => t.threat_type))].sort(), [threats]);

  const selectedIncident: IncidentRow | null = useMemo(() => {
    if (!selected?.incident_id) return null;
    return incidents.find((i) => i.id === selected.incident_id) ?? null;
  }, [selected, incidents]);

  const loadIncidentDetail = async (incidentId: string) => {
    const [n, a] = await Promise.all([fetchIncidentNotes(incidentId), fetchIncidentActivity(incidentId)]);
    setNotes(n);
    setActivity(a);
  };

  const handleFlag = async () => {
    if (!selected) return;
    setFlagBusy(true);
    try {
      await flagThreat(selected.id, flagReason || undefined);
      await refetch();
      setSelected((s) => (s ? { ...s, is_flagged: !s.is_flagged } : s));
      setFlagReason('');
    } catch (e) {
      console.error('Flag failed:', e);
    } finally {
      setFlagBusy(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!selected || !user) return;
    setCreating(true);
    try {
      const incident = await createIncident({
        threat_id: selected.id,
        title: `${THREAT_TYPE_LABELS[selected.threat_type] ?? selected.threat_type}: ${selected.indicator_value.slice(0, 40)}`,
        description: selected.source_reference ? `Source: ${selected.source_reference}` : undefined,
        severity: selected.severity,
      }, user.id);
      await refetch();
      setSelected({ ...selected, incident_id: incident.id });
      await loadIncidentDetail(incident.id);
    } catch (e) {
      console.error('Incident creation failed:', e);
    } finally {
      setCreating(false);
    }
  };

  const handleIncidentChange = async (patch: { status?: string; team_id?: string | null; assigned_analyst?: string | null }) => {
    if (!selectedIncident || !user) return;
    await updateIncident(selectedIncident, patch, user.id);
    await refetch();
    await loadIncidentDetail(selectedIncident.id);
  };

  const handleAddNote = async () => {
    if (!selectedIncident || !noteDraft.trim() || !user) return;
    setSavingNote(true);
    try {
      await addIncidentNote(selectedIncident.id, noteDraft.trim(), user.id);
      setNoteDraft('');
      await loadIncidentDetail(selectedIncident.id);
      await refetch();
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <DashboardLayout>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Globe2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-cyber font-bold text-foreground">Cyber War Room</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Real-time threat intelligence: imported malicious indicators from ThreatFox, URLhaus and other providers.
            Drag to spin, scroll to zoom, click a marker or feed entry for the full record.
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/incidents"><ShieldAlert className="h-4 w-4 mr-1" />Incident Control</Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => sync()} disabled={syncing}>
            {syncing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            {syncing ? 'Syncing…' : 'Sync now'}
          </Button>
          <Button variant={rotate ? 'default' : 'outline'} size="sm" onClick={() => setRotate((r) => !r)}>
            <RotateCw className="h-4 w-4 mr-1" />Rotate
          </Button>
        </div>
      </header>

      {/* Filters: severity, category, country, provider + globe mode */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <span className="text-xs text-muted-foreground flex items-center gap-1"><Database className="h-3.5 w-3.5" />Filters:</span>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{THREAT_TYPE_LABELS[t] ?? t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Provider" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            {providers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4">
        <Card className="relative overflow-hidden h-[460px] md:h-[600px]">
          <div className="absolute inset-0">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading intelligence…</div>
            ) : (
              <Suspense fallback={<div className="h-full flex items-center justify-center text-muted-foreground text-sm">Loading globe…</div>}>
                <ThreatGlobe threats={globeThreats} autoRotate={rotate} onSelect={(t) => { setSelected(t); if (t.incident_id) loadIncidentDetail(t.incident_id); }} />
              </Suspense>
            )}
          </div>
          <div className="absolute top-3 left-3 rounded-md bg-background/80 backdrop-blur px-3 py-2 border border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Indicators tracked</div>
            <div className="text-2xl font-mono font-bold text-primary">{threats.length.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">{markerCount} shown on globe</div>
          </div>
          {/* Globe mode filter */}
          <div className="absolute bottom-3 right-3">
            <Select value={globeMode} onValueChange={(v) => setGlobeMode(v as GlobeMode)}>
              <SelectTrigger className="h-8 w-[180px] text-xs bg-background/90 backdrop-blur"><SelectValue /></SelectTrigger>
              <SelectContent>
                {GLOBE_MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {/* Threat detail popup */}
          {selected && (
            <div className="absolute bottom-3 left-3 max-h-[85%] overflow-y-auto md:right-auto md:w-96 rounded-lg bg-background/95 backdrop-blur border border-border p-4 space-y-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex flex-wrap gap-1">
                  <Badge style={{ background: SEVERITY_COLORS[(selected.severity as Severity) ?? 'Unknown'] }} className="text-background">
                    {selected.severity === 'Unknown' ? 'Unknown' : selected.severity}
                  </Badge>
                  <Badge variant="outline">{THREAT_TYPE_LABELS[selected.threat_type] ?? selected.threat_type}</Badge>
                  {selected.is_flagged && <Badge variant="outline" className="text-primary border-primary/50"><Flag className="h-3 w-3 mr-1" />Flagged</Badge>}
                </div>
                <button aria-label="Close details" onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-sm font-mono text-foreground break-all">{selected.indicator_value}</p>
              <div className="space-y-1">
                <Field label="Provider" value={selected.provider} />
                <Field label="Source IP" value={notAvail(selected.source_ip)} />
                <Field label="Malware family" value={notAvail(selected.malware_family)} />
                <Field label="Destination IP" value={notAvail(selected.dest_ip)} />
                <Field label="Country" value={notAvail(selected.country)} />
                <Field label="City" value={notAvail(selected.city)} />
                <Field label="Destination port" value={notAvail(selected.dest_port)} />
                <Field label="Protocol" value={notAvail(selected.protocol)} />
                <Field label="Confidence" value={selected.confidence != null ? `${selected.confidence}%` : notAvail(null)} />
                <Field label="First seen" value={selected.first_seen ? new Date(selected.first_seen).toLocaleString() : notAvail(null)} />
                <Field label="Last seen" value={selected.last_seen ? new Date(selected.last_seen).toLocaleString() : notAvail(null)} />
                <Field label="Reference" value={selected.source_reference ? 'Open source reference' : notAvail(null)} />
                {selected.source_reference && (
                  <a href={selected.source_reference} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary underline break-all">
                    {selected.source_reference}
                  </a>
                )}
              </div>
              {/* Flag + incident actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant={selected.is_flagged ? 'secondary' : 'outline'} onClick={handleFlag} disabled={flagBusy} className="text-xs">
                  {flagBusy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Flag className="h-3.5 w-3.5 mr-1" />}
                  {selected.is_flagged ? 'Unflag' : 'Flag Threat'}
                </Button>
                {selected.incident_id ? (
                  <Button size="sm" variant="secondary" disabled className="text-xs"><ShieldAlert className="h-3.5 w-3.5 mr-1" />Incident open</Button>
                ) : (
                  <Button size="sm" onClick={handleCreateIncident} disabled={creating} className="text-xs">
                    {creating ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5 mr-1" />}
                    Create Incident
                  </Button>
                )}
              </div>
              <Input
                placeholder="Optional reason for flagging…"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="h-8 text-xs"
              />
              {/* Incident management */}
              {selectedIncident && (
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Incident {selectedIncident.id.slice(0, 8)} · {selectedIncident.status}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={selectedIncident.status} onValueChange={(v) => handleIncidentChange({ status: v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['New', 'Under Investigation', 'Assigned', 'Contained', 'Mitigated', 'Resolved', 'Closed'].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedIncident.team_id ?? 'none'} onValueChange={(v) => handleIncidentChange({ team_id: v === 'none' ? null : v })}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Assign team" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No team</SelectItem>
                        {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Assigned analyst…"
                    defaultValue={selectedIncident.assigned_analyst ?? ''}
                    onBlur={(e) => handleIncidentChange({ assigned_analyst: e.target.value || null })}
                    className="h-8 text-xs"
                  />
                  <div className="flex gap-1.5">
                    <Textarea
                      placeholder="Add investigation note…"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      className="min-h-[52px] text-xs"
                    />
                    <Button size="sm" onClick={handleAddNote} disabled={savingNote || !noteDraft.trim()} className="text-xs self-end">
                      {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                  {notes.length > 0 && (
                    <ul className="space-y-1 max-h-24 overflow-y-auto">
                      {notes.map((n) => (
                        <li key={n.id} className="text-[11px] text-muted-foreground border-l-2 border-border pl-2">
                          {new Date(n.created_at).toLocaleString()} — <span className="text-foreground">{n.note}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {activity.length > 0 && (
                    <details className="text-[11px] text-muted-foreground">
                      <summary className="cursor-pointer">History ({activity.length})</summary>
                      <ul className="mt-1 space-y-0.5 max-h-24 overflow-y-auto">
                        {activity.map((a) => (
                          <li key={a.id}>{new Date(a.created_at).toLocaleTimeString()} — {a.action}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
              <Button asChild size="sm" variant="outline" className="w-full text-xs">
                <Link to="/security-labs">Practice defending: Security Labs<ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          {/* Sync status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Intelligence sync</h2>
                <Button variant="ghost" size="sm" onClick={() => sync()} disabled={syncing} className="h-7 text-xs">
                  <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">
                Last sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'never'}
              </p>
              {loading ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : (
                <ul className="space-y-1">
                  {providerStatus.map((p) => (
                    <li key={p.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground">{p.provider}</span>
                      <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                    </li>
                  ))}
                  {!providerStatus.length && <li className="text-xs text-muted-foreground">No sync yet — click the refresh button.</li>}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold mb-1">Most targeted</h2>
              <p className="text-[10px] text-muted-foreground mb-3">Reported malicious indicators by country (intelligence, not observed attack destinations)</p>
              {targeted.length === 0 && <p className="text-xs text-muted-foreground">No geolocated indicators yet.</p>}
              {targeted.map(([country, n]) => (
                <div key={country} className="flex items-center gap-2 mb-2 text-xs">
                  <span className="w-24 truncate text-foreground">{country}</span>
                  <div className="flex-1 h-1.5 rounded bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${(n / targeted[0][1]) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-muted-foreground">{n}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="p-4">
              <h2 className="text-sm font-semibold mb-3">Live feed</h2>
              <ul className="space-y-1.5 max-h-[380px] overflow-y-auto font-mono text-[11px]">
                {filtered.slice(0, 60).map((t) => {
                  const ts = t.first_seen ?? t.last_seen ?? t.created_at;
                  const sev = (t.severity as Severity) ?? 'Unknown';
                  return (
                    <li key={t.id}>
                      <button onClick={() => { setSelected(t); if (t.incident_id) loadIncidentDetail(t.incident_id); }} className="w-full text-left flex gap-2 hover:bg-muted/50 rounded px-1 py-0.5 items-center">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[sev] }} title={sev} />
                        <span className="text-muted-foreground">{ts ? new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}</span>
                        <span className="text-foreground truncate flex-1">{t.indicator_value}</span>
                        <span className="text-muted-foreground flex-shrink-0">{t.country ?? t.provider}</span>
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && <li className="text-muted-foreground">No indicators match the filters.</li>}
              </ul>
              {filtered.length > 60 && <p className="text-[10px] text-muted-foreground mt-2">Showing the newest 60 of {filtered.length}.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Data shown is real threat intelligence (reported malicious indicators and historical threat data) — not a live network attack stream.
      </p>
    </DashboardLayout>
  );
};

export default ThreatMap;
