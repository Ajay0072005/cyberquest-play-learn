-- Add DELETE policy so users can reset their own lab progress
CREATE POLICY "Users can delete their own lab progress"
ON public.lab_progress
FOR DELETE
USING (auth.uid() = user_id);