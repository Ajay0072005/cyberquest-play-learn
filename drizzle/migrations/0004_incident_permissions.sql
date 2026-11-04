CREATE OR REPLACE FUNCTION public.link_threat_incident(_threat_id uuid, _incident_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.threat_indicators
  SET incident_id = _incident_id, updated_at = now()
  WHERE id = _threat_id;
END
$$;

REVOKE ALL ON FUNCTION public.link_threat_incident(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.link_threat_incident(uuid, uuid) TO authenticated;

DROP POLICY "Users can update incidents" ON public.incidents;
CREATE POLICY "Admins and moderators can update incidents"
  ON public.incidents
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));