-- Add a SELECT policy for authenticated users to read profiles for leaderboard
-- This is more restrictive than before - only shows users with points > 0
CREATE POLICY "Authenticated users can view leaderboard profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (points > 0);