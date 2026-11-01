CREATE TABLE public.threat_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  threat_type text NOT NULL,
  indicator_value text NOT NULL,
  source_ip text,
  dest_ip text,
  country text,
  city text,
  latitude double precision,
  longitude double precision,
  dest_port integer,
  protocol text,
  severity text NOT NULL DEFAULT 'Unknown',
  confidence integer,
  first_seen timestamptz,
  last_seen timestamptz,
  source_reference text,
  is_flagged boolean NOT NULL DEFAULT false,
  flagged_at timestamptz,
  flagged_by uuid,
  incident_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE public.security_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_id uuid REFERENCES public.threat_indicators(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'Unknown',
  status text NOT NULL DEFAULT 'New',
  team_id uuid REFERENCES public.security_teams(id) ON DELETE SET NULL,
  assigned_analyst text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.incident_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
  author_id uuid,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.incident_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.threat_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_id uuid REFERENCES public.threat_indicators(id) ON DELETE CASCADE NOT NULL,
  flagged_by uuid NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.intelligence_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  status text NOT NULL,
  records_imported integer NOT NULL DEFAULT 0,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.threat_geo_cache (
  ip text PRIMARY KEY,
  country text,
  city text,
  latitude double precision,
  longitude double precision,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_threat_indicators_severity ON public.threat_indicators(severity);
CREATE INDEX idx_threat_indicators_type ON public.threat_indicators(threat_type);
CREATE INDEX idx_threat_indicators_provider ON public.threat_indicators(provider);
CREATE INDEX idx_threat_indicators_created ON public.threat_indicators(created_at DESC);
CREATE INDEX idx_threat_indicators_country ON public.threat_indicators(country);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incident_notes_incident ON public.incident_notes(incident_id);
CREATE INDEX idx_incident_activity_incident ON public.incident_activity(incident_id);
CREATE INDEX idx_threat_flags_threat ON public.threat_flags(threat_id);

ALTER TABLE public.threat_indicators
  ADD CONSTRAINT fk_threat_incident FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE SET NULL;

GRANT SELECT ON public.threat_indicators TO authenticated;
GRANT ALL ON public.threat_indicators TO service_role;
GRANT SELECT ON public.security_teams TO authenticated;
GRANT ALL ON public.security_teams TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
GRANT SELECT, INSERT ON public.incident_notes TO authenticated;
GRANT ALL ON public.incident_notes TO service_role;
GRANT SELECT, INSERT ON public.incident_activity TO authenticated;
GRANT ALL ON public.incident_activity TO service_role;
GRANT SELECT, INSERT ON public.threat_flags TO authenticated;
GRANT ALL ON public.threat_flags TO service_role;
GRANT SELECT ON public.intelligence_sync_logs TO authenticated;
GRANT ALL ON public.intelligence_sync_logs TO service_role;
GRANT ALL ON public.threat_geo_cache TO service_role;

ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_geo_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Threat indicators are viewable by authenticated users"
  ON public.threat_indicators FOR SELECT TO authenticated USING (true);

CREATE POLICY "Security teams are viewable by authenticated users"
  ON public.security_teams FOR SELECT TO authenticated USING (true);

CREATE POLICY "Incidents are viewable by authenticated users"
  ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create incidents"
  ON public.incidents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update incidents"
  ON public.incidents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Incident notes are viewable by authenticated users"
  ON public.incident_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can add incident notes"
  ON public.incident_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Incident activity is viewable by authenticated users"
  ON public.incident_activity FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can record incident activity"
  ON public.incident_activity FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "Threat flags are viewable by authenticated users"
  ON public.threat_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can flag threats"
  ON public.threat_flags FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Sync logs are viewable by authenticated users"
  ON public.intelligence_sync_logs FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.toggle_threat_flag(_threat_id uuid, _reason text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _now_flagged boolean;
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT is_flagged INTO _now_flagged FROM threat_indicators WHERE id = _threat_id;
  IF _now_flagged IS NULL THEN
    RAISE EXCEPTION 'Threat not found';
  END IF;
  UPDATE threat_indicators
    SET is_flagged = NOT _now_flagged,
        flagged_at = CASE WHEN _now_flagged THEN NULL ELSE now() END,
        flagged_by = CASE WHEN _now_flagged THEN NULL ELSE _uid END,
        updated_at = now()
    WHERE id = _threat_id;
  IF NOT _now_flagged THEN
    INSERT INTO threat_flags (threat_id, flagged_by, reason) VALUES (_threat_id, _uid, _reason);
  END IF;
  RETURN NOT _now_flagged;
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_threat_flag(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_threat_indicators ON public.threat_indicators;
CREATE TRIGGER trg_touch_threat_indicators BEFORE UPDATE ON public.threat_indicators
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_touch_incidents ON public.incidents;
CREATE TRIGGER trg_touch_incidents BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.security_teams (name, description) VALUES
  ('SOC Level 1', 'Tier 1 alert triage and initial monitoring'),
  ('SOC Level 2', 'Tier 2 investigation and escalation'),
  ('Incident Response', 'Containment, eradication and recovery'),
  ('Threat Intelligence', 'Indicator research and attribution'),
  ('Malware Analysis', 'Sample analysis and reverse engineering'),
  ('Network Security', 'Perimeter, firewall and network defence')
ON CONFLICT (name) DO NOTHING;
