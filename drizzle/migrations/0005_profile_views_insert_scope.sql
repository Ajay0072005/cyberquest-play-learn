DROP POLICY "Authenticated users can record a profile view" ON public.profile_views;
CREATE POLICY "Authenticated users can record their own profile views"
  ON public.profile_views
  FOR INSERT
  TO authenticated
  WITH CHECK (viewer_id IS NOT NULL AND auth.uid() = viewer_id AND profile_user_id IS NOT NULL);