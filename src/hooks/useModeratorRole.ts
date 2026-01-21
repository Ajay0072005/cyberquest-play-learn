import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useModeratorRole = () => {
  const { user } = useAuth();
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkModeratorRole = async () => {
      if (!user) {
        setIsModerator(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user has moderator OR admin role (admins have moderator privileges)
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['moderator', 'admin']);

        if (error) {
          console.error('Error checking moderator role:', error);
          setIsModerator(false);
        } else {
          setIsModerator(data && data.length > 0);
        }
      } catch (err) {
        console.error('Error checking moderator role:', err);
        setIsModerator(false);
      } finally {
        setLoading(false);
      }
    };

    checkModeratorRole();
  }, [user]);

  return { isModerator, loading };
};
