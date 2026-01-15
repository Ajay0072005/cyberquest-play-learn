import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LabProgress {
  id: string;
  user_id: string;
  lab_id: string;
  lab_type: string;
  points_earned: number;
  completed_at: string;
}

export const useLabProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completedLabs, setCompletedLabs] = useState<LabProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch completed labs
  const fetchProgress = useCallback(async () => {
    if (!user) {
      setCompletedLabs([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lab_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCompletedLabs(data || []);
    } catch (error) {
      console.error('Error fetching lab progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount and subscribe to changes
  useEffect(() => {
    fetchProgress();

    if (user) {
      const channel = supabase
        .channel('lab-progress-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lab_progress',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchProgress();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchProgress]);

  // Check if a specific lab is completed
  const isLabCompleted = useCallback(
    (labId: string, labType: string): boolean => {
      return completedLabs.some(
        (lab) => lab.lab_id === labId && lab.lab_type === labType
      );
    },
    [completedLabs]
  );

  // Get progress for a specific lab type
  const getProgressByType = useCallback(
    (labType: string): LabProgress[] => {
      return completedLabs.filter((lab) => lab.lab_type === labType);
    },
    [completedLabs]
  );

  // Mark a lab as completed
  const completeLab = useCallback(
    async (labId: string, labType: string, points: number): Promise<boolean> => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to track progress',
          variant: 'destructive',
        });
        return false;
      }

      // Check if already completed
      if (isLabCompleted(labId, labType)) {
        return true;
      }

      try {
        const { error } = await supabase.from('lab_progress').insert({
          user_id: user.id,
          lab_id: labId,
          lab_type: labType,
          points_earned: points,
        });

        if (error) {
          if (error.code === '23505') {
            return true;
          }
          throw error;
        }

        setCompletedLabs((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            user_id: user.id,
            lab_id: labId,
            lab_type: labType,
            points_earned: points,
            completed_at: new Date().toISOString(),
          },
        ]);

        toast({
          title: 'Lab Completed! 🎉',
          description: `You earned ${points} points!`,
        });

        return true;
      } catch (error) {
        console.error('Error saving lab progress:', error);
        toast({
          title: 'Error',
          description: 'Failed to save progress',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, isLabCompleted, toast]
  );

  // Reset a single lab's progress
  const resetLabProgress = useCallback(
    async (labId: string, labType: string): Promise<boolean> => {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to reset progress',
          variant: 'destructive',
        });
        return false;
      }

      try {
        const { error } = await supabase
          .from('lab_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lab_id', labId)
          .eq('lab_type', labType);

        if (error) throw error;

        setCompletedLabs((prev) =>
          prev.filter((lab) => !(lab.lab_id === labId && lab.lab_type === labType))
        );

        toast({
          title: 'Progress Reset',
          description: 'Lab progress has been reset. You can replay it now!',
        });

        return true;
      } catch (error) {
        console.error('Error resetting lab progress:', error);
        toast({
          title: 'Error',
          description: 'Failed to reset progress',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, toast]
  );

  // Reset all lab progress
  const resetAllProgress = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to reset progress',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('lab_progress')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setCompletedLabs([]);

      toast({
        title: 'All Progress Reset',
        description: 'All lab progress has been reset. Start fresh!',
      });

      return true;
    } catch (error) {
      console.error('Error resetting all progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset progress',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  // Get total points earned from labs
  const getTotalLabPoints = useCallback((): number => {
    return completedLabs.reduce((sum, lab) => sum + lab.points_earned, 0);
  }, [completedLabs]);

  // Get completion stats
  const getStats = useCallback(
    (totalLabs: { [key: string]: number }) => {
      const stats: { [key: string]: { completed: number; total: number } } = {};
      
      for (const [labType, total] of Object.entries(totalLabs)) {
        const completed = getProgressByType(labType).length;
        stats[labType] = { completed, total };
      }
      
      return stats;
    },
    [getProgressByType]
  );

  return {
    completedLabs,
    loading,
    isLabCompleted,
    getProgressByType,
    completeLab,
    resetLabProgress,
    resetAllProgress,
    getTotalLabPoints,
    getStats,
    refetch: fetchProgress,
  };
};
