-- Create a secure view for leaderboard data with limited columns
CREATE VIEW public.leaderboard 
WITH (security_invoker=on) AS
SELECT 
  id,
  username,
  avatar_url,
  points
FROM public.profiles
WHERE points > 0
ORDER BY points DESC
LIMIT 100;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.leaderboard TO authenticated;

-- Drop the overly permissive policy that allows all authenticated users to see all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;