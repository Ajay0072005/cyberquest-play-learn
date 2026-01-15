-- Create lab_progress table to track completed labs
CREATE TABLE public.lab_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lab_id TEXT NOT NULL,
  lab_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lab_id, lab_type)
);

-- Enable Row Level Security
ALTER TABLE public.lab_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own lab progress
CREATE POLICY "Users can view their own lab progress"
ON public.lab_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own lab progress
CREATE POLICY "Users can insert their own lab progress"
ON public.lab_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own lab progress
CREATE POLICY "Users can update their own lab progress"
ON public.lab_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Enable realtime for lab_progress table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_progress;