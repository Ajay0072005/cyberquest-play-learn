# CyberQuest — Agent Notes

- Cyber War Room: `threat_indicators` is SELECT-only for end users; all writes (flags aside) go through SECURITY DEFINER RPCs (`toggle_threat_flag`, `link_threat_incident`) or the JWT-protected `threat-sync` edge function — never grant UPDATE on the indicator table to authenticated users. Why: the spec requires users to flag/report but not tamper with intelligence records.
- Threat intel providers: ThreatFox and URLhaus community APIs now require provider Auth-Keys (secrets `THREATFOX_AUTH_KEY` / `URLHAUS_AUTH_KEY`); Feodo Tracker is the keyless source and must stay the default. Severity is derived only from provider confidence; when a provider publishes none, severity stays "Unknown" — never invent severity or coordinates.
