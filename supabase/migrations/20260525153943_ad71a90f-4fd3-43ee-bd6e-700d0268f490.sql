-- Followers
CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone"
ON public.user_follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others"
ON public.user_follows FOR INSERT TO authenticated
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.user_follows FOR DELETE TO authenticated
USING (auth.uid() = follower_id);

CREATE INDEX idx_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_follows_following ON public.user_follows(following_id);

-- Profile views
CREATE TABLE public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_user_id uuid NOT NULL,
  viewer_id uuid,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile owner can view their view records"
ON public.profile_views FOR SELECT TO authenticated
USING (auth.uid() = profile_user_id);

CREATE POLICY "Authenticated users can record a profile view"
ON public.profile_views FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX idx_profile_views_user ON public.profile_views(profile_user_id);