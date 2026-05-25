
-- Prevent users from directly setting/manipulating leaderboard points
CREATE OR REPLACE FUNCTION public.prevent_leaderboard_points_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow moderators/admins to set any points
  IF public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Users may only insert their own row, with points = 0
    NEW.points := 0;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Users may not change points themselves
    NEW.points := OLD.points;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_leaderboard_points ON public.leaderboard;
CREATE TRIGGER enforce_leaderboard_points
BEFORE INSERT OR UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.prevent_leaderboard_points_tampering();

-- Explicit restrictive policy to deny UPDATE on user_roles for everyone (admins manage via delete+insert)
CREATE POLICY "Block all updates on user_roles"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO public
USING (false)
WITH CHECK (false);
