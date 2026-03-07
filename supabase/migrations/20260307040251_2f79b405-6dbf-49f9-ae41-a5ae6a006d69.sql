
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard;

CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard
FOR SELECT
TO anon, authenticated
USING (true);
