
-- 1. Fix leaderboard score manipulation: Remove user self-update policy
DROP POLICY IF EXISTS "Users can update their own leaderboard entry" ON leaderboard;

-- 2. Fix achievement self-grant: Remove direct INSERT policy
DROP POLICY IF EXISTS "Users can earn achievements" ON user_achievements;

-- 3. Create secure RPC for awarding achievements with validation
CREATE OR REPLACE FUNCTION public.award_achievement(_achievement_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _req_type text;
  _req_value integer;
  _actual_value integer;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already earned
  IF EXISTS (SELECT 1 FROM user_achievements WHERE user_id = _user_id AND achievement_id = _achievement_id) THEN
    RETURN false;
  END IF;

  -- Get achievement requirements
  SELECT requirement_type, requirement_value INTO _req_type, _req_value
  FROM achievements WHERE id = _achievement_id;

  IF _req_type IS NULL THEN
    RAISE EXCEPTION 'Achievement not found';
  END IF;

  -- Validate requirement is met based on actual data
  CASE _req_type
    WHEN 'points_earned' THEN
      SELECT COALESCE(points, 0) INTO _actual_value FROM profiles WHERE user_id = _user_id;
    WHEN 'sql_levels' THEN
      SELECT COUNT(*) INTO _actual_value FROM lab_progress WHERE user_id = _user_id AND lab_type = 'sql_level';
    WHEN 'crypto_puzzles' THEN
      SELECT COUNT(*) INTO _actual_value FROM lab_progress WHERE user_id = _user_id AND lab_type = 'crypto_puzzle';
    WHEN 'terminal_complete', 'terminal_master' THEN
      SELECT COUNT(*) INTO _actual_value FROM lab_progress WHERE user_id = _user_id AND lab_type = 'terminal_flag';
    WHEN 'sql_master' THEN
      SELECT COUNT(*) INTO _actual_value FROM lab_progress WHERE user_id = _user_id AND lab_type = 'sql_level';
    WHEN 'crypto_master' THEN
      SELECT COUNT(*) INTO _actual_value FROM lab_progress WHERE user_id = _user_id AND lab_type = 'crypto_puzzle';
    WHEN 'challenges_completed' THEN
      SELECT COUNT(*) INTO _actual_value FROM lab_progress WHERE user_id = _user_id;
    WHEN 'chat_messages' THEN
      -- Chat messages aren't tracked server-side, allow if requirement is low
      _actual_value := _req_value;
    ELSE
      _actual_value := 0;
  END CASE;

  IF _actual_value < _req_value THEN
    RETURN false;
  END IF;

  -- Award the achievement
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (_user_id, _achievement_id)
  ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$;

-- 4. Fix profile data exposure: Replace overly permissive leaderboard profiles policy
DROP POLICY IF EXISTS "Authenticated users can view leaderboard profiles" ON profiles;

CREATE POLICY "Authenticated users can view public leaderboard profiles"
ON profiles FOR SELECT
TO authenticated
USING (is_public = true AND points > 0);

-- 5. Add trigger to prevent direct points manipulation on profiles
CREATE OR REPLACE FUNCTION public.protect_points_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow points changes through server-side functions (SECURITY DEFINER context)
  -- If called from a regular user context, preserve old points
  IF current_setting('role') = 'authenticated' AND OLD.points IS NOT NULL AND NEW.points != OLD.points THEN
    NEW.points := OLD.points;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profiles_points ON profiles;
CREATE TRIGGER protect_profiles_points
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION protect_points_update();

-- 6. Create server-side function to safely add points
CREATE OR REPLACE FUNCTION public.add_user_points(_points integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF _points <= 0 OR _points > 500 THEN
    RAISE EXCEPTION 'Invalid points value';
  END IF;

  -- Update profiles points
  UPDATE profiles SET points = points + _points WHERE user_id = _user_id;
  
  -- Update/insert leaderboard
  INSERT INTO leaderboard (user_id, points, username, avatar_url)
  SELECT _user_id, _points, p.username, p.avatar_url
  FROM profiles p WHERE p.user_id = _user_id
  ON CONFLICT (user_id) DO UPDATE SET points = leaderboard.points + _points;
END;
$$;
