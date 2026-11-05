import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useAuth } from '@/context/AuthContext';
import { useThreatIntel } from '@/hooks/useThreatIntel';
import {
  approveIncident, updateIncident, incidentStatuses, notAvail,
  SEVERITIES, SEVERITY_COLORS, THREAT_TYPE_LABELS,
  type Severity, type IncidentRow,
} from '@/services/threatIntel';
import { toast } from 'sonner';
import { CheckCircle2, Clock, ExternalLink, Loader2, ShieldAlert, UserCog } from 'lucide-react';

const WarRoomAdmin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const { threats, incidents, teams, loading, refetch } = useThreatIntel();

  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const threatById = useMemo(
    () => new Map(threats.map((t) => [t.id, t])),
    [threats],
  );
  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);

  const filtered = useMemo(() => incidents.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (approvalFilter === 'approved' && !i.approved) return false;
    if (approvalFilter === 'pending' && i.approved) return false;
    if (search) {
      const threat = i.threat_id ? threatById.get(i.threat_id) : undefined;
      const hay = `${i.title} ${i.description ?? ''} ${threat?.indicator_value ?? ''} ${threat?.source_ip ?? ''}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [incidents, statusFilter, approvalFilter, search, threatById]);

  if (adminLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh] gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading incident control panel…
        </div>
      </DashboardLayout>
    );
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
      await refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = (inc: IncidentRow) =>
    withBusy(inc.id, async () => {
      await approveIncident(inc.id);
      toast.success('Incident approved');
    });

  const handleUpdate = (inc: IncidentRow, patch: Partial<IncidentRow>) =>
    withBusy(inc.id, async () => {
      await updateIncident(inc, patch, user!.id);
      toast.success('Incident updated');
    });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cyber font-bold flex items-center gap-2">
              <ShieldAlert className="h-7 w-7 text-primary" /> Incident Control
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Review, approve and assign War Room incidents to response teams. Every change is
              recorded in the incident history.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/threat-map"><ExternalLink className="h-4 w-4" /> Open War Room</Link>
          </Button>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search title, description or indicator…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {incidentStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={approvalFilter} onValueChange={setApprovalFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All approvals</SelectItem>
              <SelectItem value="pending">Pending approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length} of {incidents.length} incidents</span>
        </div>

        {/* Incident list */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No incidents match the filters. Incidents created from the War Room appear here.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((inc) => {
              const threat = inc.threat_id ? threatById.get(inc.threat_id) : undefined;
              const busy = busyId === inc.id;
              const sev = (inc.severity as Severity) ?? 'Unknown';
              return (
                <Card key={inc.id} className={inc.approved ? '' : 'border-dashed'}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: SEVERITY_COLORS[sev] }} title={sev} />
                          <h3 className="font-semibold truncate">{inc.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {THREAT_TYPE_LABELS[threat?.threat_type ?? ''] ?? 'Threat intelligence incident'}
                          {threat && <> — <span className="font-mono">{notAvail(threat.indicator_value)}</span></>}
                          {threat?.country && <> · {threat.country}</>}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" style={{ color: SEVERITY_COLORS[sev] }}>{sev}</Badge>
                        <Badge variant="secondary">{inc.status}</Badge>
                        {inc.approved ? (
                          <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
                        )}
                      </div>
                    </div>

                    {inc.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{inc.description}</p>
                    )}

                    <div className="flex flex-wrap items-end gap-3">
                      {!inc.approved && (
                        <Button size="sm" onClick={() => handleApprove(inc)} disabled={busy}>
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Approve
                        </Button>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1"><UserCog className="h-3 w-3" /> Team</label>
                        <Select
                          value={inc.team_id ?? 'none'}
                          onValueChange={(v) => handleUpdate(inc, { team_id: v === 'none' ? null : v })}
                        >
                          <SelectTrigger className="w-48 h-9"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {inc.team_id && teamById.get(inc.team_id)?.description && (
                          <p className="text-[10px] text-muted-foreground max-w-48 truncate">{teamById.get(inc.team_id)!.description}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground">Status</label>
                        <Select value={inc.status} onValueChange={(v) => handleUpdate(inc, { status: v })}>
                          <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {incidentStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-muted-foreground">Assigned analyst</label>
                        <Input
                          className="w-48 h-9"
                          placeholder={notAvail(inc.assigned_analyst)}
                          defaultValue={inc.assigned_analyst ?? ''}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v !== (inc.assigned_analyst ?? '')) handleUpdate(inc, { assigned_analyst: v || null });
                          }}
                        />
                      </div>

                      <span className="text-[10px] text-muted-foreground ml-auto">
                        Created {new Date(inc.created_at).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          Only admins and moderators can approve or change incidents. Approvals and assignments are stored on the incident record and in its activity history.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default WarRoomAdmin;
