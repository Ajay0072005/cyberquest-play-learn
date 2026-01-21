-- Add policy to allow moderators to update any leaderboard entry
CREATE POLICY "Moderators can update any leaderboard entry"
ON public.leaderboard
FOR UPDATE
USING (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'moderator'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- Add policy to allow moderators to view all profiles for moderation
CREATE POLICY "Moderators can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'moderator'::app_role));