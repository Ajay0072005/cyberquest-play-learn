-- Create achievements table for storing available achievements
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table to track earned achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by everyone
CREATE POLICY "Achievements are viewable by everyone"
ON public.achievements FOR SELECT
USING (true);

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
USING (auth.uid() = user_id);

-- Users can earn achievements
CREATE POLICY "Users can earn achievements"
ON public.user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, points, category, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first challenge', 'trophy', 10, 'general', 'challenges_completed', 1),
('Crypto Novice', 'Solve 3 cryptography puzzles', 'key', 25, 'crypto', 'crypto_puzzles', 3),
('Crypto Expert', 'Solve 10 cryptography puzzles', 'shield', 50, 'crypto', 'crypto_puzzles', 10),
('SQL Rookie', 'Complete the SQL Injection tutorial', 'database', 25, 'sql', 'sql_levels', 1),
('SQL Master', 'Complete all SQL Injection levels', 'zap', 75, 'sql', 'sql_levels', 5),
('Terminal Hacker', 'Complete the terminal challenge', 'terminal', 50, 'terminal', 'terminal_complete', 1),
('Point Collector', 'Earn 100 points', 'star', 20, 'general', 'points_earned', 100),
('Rising Star', 'Earn 500 points', 'award', 50, 'general', 'points_earned', 500),
('Elite Hacker', 'Earn 1000 points', 'crown', 100, 'general', 'points_earned', 1000),
('Curious Mind', 'Ask CyberBot 5 questions', 'message-circle', 15, 'chat', 'chat_messages', 5);