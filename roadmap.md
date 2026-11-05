# Roadmap — Cyber War Room → Real-Time Threat Intelligence

Spec: user-uploaded "CYBERQUEST — UPGRADE EXISTING CYBER WAR ROOM" doc. Modify existing components only; no fake data.

## Tasks
- [x] DB migration: threat_indicators, incidents, security_teams (+seed 6 teams), incident_notes, incident_activity, threat_flags, intelligence_sync_logs, threat_geo_cache; GRANT + RLS + indexes + flag RPC
- [x] Edge function `threat-sync`: Feodo Tracker (keyless, verified importing real C2 indicators), ThreatFox + URLhaus (now require provider Auth-Keys → shown as requires-configuration), OTX + AbuseIPDB (require-config path), IP geo resolution w/ cache, dedupe upsert, sync logs, JWT check (deployed + verified)
- [x] Shared data service `src/services/threatIntel.ts` + hook `src/hooks/useThreatIntel.ts` (realtime)
- [x] ThreatGlobe: real markers (severity colors), arcs only when src+dest coords exist, remove fake city nodes, hover/click detail
- [x] ThreatMap page: real feed, filters (severity/category/country/provider), detail panel w/ Flag + Create Incident + incident management (status/team/notes/activity), dynamic Most Targeted, sync status, manual refresh
- [x] Incident permissions: threat→incident linking via `link_threat_incident` SECURITY DEFINER RPC; incidents UPDATE restricted to admin/moderator
- [x] WarRoomWidget (Dashboard): real counts + sync status
- [x] Cybersecurity Labs page (/security-labs): guided labs, XP via add_user_points + lab_progress; TopNav + War Room link
- [x] Header copy: threat intelligence labels, not simulated attack stream
- [x] Verify: migration applied, function sync test (5 real Feodo indicators, geolocated), incident create/link e2e, typecheck clean, build log clean

## Notes
- ThreatFox & URLhaus community APIs now require a free provider Auth-Key (secrets `THREATFOX_AUTH_KEY`, `URLHAUS_AUTH_KEY`). Until added they show "requires-configuration" — Feodo Tracker provides keyless real data meanwhile.
