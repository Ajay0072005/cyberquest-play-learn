import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  ThreatRow, IncidentRow, SecurityTeamRow, SyncLogRow,
  fetchThreats, fetchIncidents, fetchSecurityTeams, fetchSyncLogs, runThreatSync,
} from '@/services/threatIntel';

const SYNC_MIN_INTERVAL_MS = 30 * 60 * 1000; // auto-sync at most every 30 minutes

/** Loads real threat intelligence from the database and keeps it in sync via
 *  Supabase Realtime + the threat-sync edge function. Shared by the War Room
 *  page and the dashboard/homepage widget so they always show the same data. */
export function useThreatIntel() {
  const { user } = useAuth();
  const [threats, setThreats] = useState<ThreatRow[]>([]);
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [teams, setTeams] = useState<SecurityTeamRow[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const autoSyncRan = useRef(false);

  const refetch = useCallback(async () => {
    const [t, i, tm, l] = await Promise.allSettled([
      fetchThreats(), fetchIncidents(), fetchSecurityTeams(), fetchSyncLogs(),
    ]);
    if (t.status === 'fulfilled') setThreats(t.value);
    if (i.status === 'fulfilled') setIncidents(i.value);
    if (tm.status === 'fulfilled') setTeams(tm.value);
    if (l.status === 'fulfilled') setSyncLogs(l.value);
    setLoading(false);
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await runThreatSync();
    } catch (e) {
      console.error('Threat sync failed:', e);
    } finally {
      await refetch();
      setSyncing(false);
    }
  }, [refetch]);

  // Initial load; auto-sync when the last sync is stale or missing
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const logs = await fetchSyncLogs(1);
      if (cancelled) return;
      const last = logs[0]?.created_at ? new Date(logs[0].created_at).getTime() : 0;
      await refetch();
      if (!autoSyncRan.current && (Date.now() - last > SYNC_MIN_INTERVAL_MS)) {
        autoSyncRan.current = true;
        sync();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime: database changes flow into the UI
  useEffect(() => {
    const channel = supabase
      .channel(`threat-intel-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threat_indicators' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intelligence_sync_logs' }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  const lastSyncAt = useMemo(() => syncLogs[0]?.created_at ?? null, [syncLogs]);

  /** Provider status summary derived from the latest sync log per provider. */
  const providerStatus = useMemo(() => {
    const map = new Map<string, SyncLogRow>();
    for (const log of syncLogs) {
      const existing = map.get(log.provider);
      if (!existing || new Date(log.created_at) > new Date(existing.created_at)) map.set(log.provider, log);
    }
    return [...map.values()].sort((a, b) => a.provider.localeCompare(b.provider));
  }, [syncLogs]);

  return {
    threats, incidents, teams, syncLogs, loading, syncing,
    lastSyncAt, providerStatus,
    user, sync, refetch,
  };
}
