-- Create app_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for role-based access control
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop the leaderboard view and recreate as a table for proper RLS
DROP VIEW IF EXISTS public.leaderboard;

-- Create leaderboard as a table
CREATE TABLE public.leaderboard (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username text,
    avatar_url text,
    points integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on leaderboard
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view leaderboard (public read access)
CREATE POLICY "Anyone can view leaderboard"
ON public.leaderboard
FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own score
CREATE POLICY "Users can insert their own leaderboard entry"
ON public.leaderboard
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own entries
CREATE POLICY "Users can update their own leaderboard entry"
ON public.leaderboard
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Only admins can delete leaderboard entries
CREATE POLICY "Only admins can delete leaderboard entries"
ON public.leaderboard
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_leaderboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard
FOR EACH ROW
EXECUTE FUNCTION public.update_leaderboard_updated_at();