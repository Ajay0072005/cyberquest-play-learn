# Roadmap — Cyber War Room → Real-Time Threat Intelligence

Spec: user-uploaded "CYBERQUEST — UPGRADE EXISTING CYBER WAR ROOM" doc. Modify existing components only; no fake data.

## Tasks
- [ ] DB migration: threat_indicators, incidents, security_teams (+seed 6 teams), incident_notes, incident_activity, threat_flags, intelligence_sync_logs, threat_geo_cache; GRANT + RLS + indexes + flag RPC
- [ ] Edge function `threat-sync`: ThreatFox + URLhaus (keyless), OTX + AbuseIPDB (require-config path), IP geo resolution w/ cache, dedupe upsert, sync logs, JWT check
- [ ] Shared data service `src/services/threatIntel.ts` + hook `src/hooks/useThreatIntel.ts` (realtime)
- [ ] ThreatGlobe: real markers (severity colors), arcs only when src+dest coords exist, remove fake city nodes, hover/click detail
- [ ] ThreatMap page: real feed, filters (severity/category/country/provider), detail panel w/ Flag + Create Incident + incident management (status/team/notes/activity), dynamic Most Targeted, sync status, manual refresh
- [ ] WarRoomWidget (Dashboard + homepage preview): real counts + sync status
- [ ] Cybersecurity Labs page (/security-labs): 14 lab nodes, guided challenges, XP via add_user_points + lab_progress; TopNav + War Room link
- [ ] Update header copy: threat intelligence labels, not simulated attack stream
- [ ] Verify: migration applied, function test, typecheck, browser check signed-in, build log clean
