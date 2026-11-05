ALTER TABLE public.incidents
  ADD COLUMN approved boolean NOT NULL DEFAULT false,
  ADD COLUMN approved_by uuid,
  ADD COLUMN approved_at timestamptz;

CREATE OR REPLACE FUNCTION public.approve_incident(_incident_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(public.auth.uid(), 'admin'::app_role) OR public.has_role(public.auth.uid(), 'moderator'::app_role)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.incidents
  SET approved = true,
      approved_by = public.auth.uid(),
      approved_at = now(),
      updated_at = now()
  WHERE id = _incident_id;
END
$$;

REVOKE ALL ON FUNCTION public.approve_incident(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.approve_incident(uuid) TO authenticated;