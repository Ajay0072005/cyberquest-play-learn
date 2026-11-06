CREATE OR REPLACE FUNCTION public.approve_incident(_incident_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'moderator'::public.app_role)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.incidents
  SET approved = true,
      approved_by = auth.uid(),
      approved_at = now(),
      updated_at = now()
  WHERE id = _incident_id;
END
$$;

GRANT EXECUTE ON FUNCTION public.approve_incident(uuid) TO authenticated;