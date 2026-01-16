-- Drop and recreate the leaderboard view with security_invoker enabled
-- This ensures the view respects RLS policies of the underlying profiles table

DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = on)
AS
SELECT 
  id,
  username,
  avatar_url,
  points
FROM public.profiles
WHERE points > 0
ORDER BY points DESC;