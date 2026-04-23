import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDevMode } from '@/contexts/DevModeContext';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const { devMode } = useDevMode();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (devMode) {
      setUser({
        id: 'dev-user',
        email: 'dev@example.com',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
      } as User);
      setLoading(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) setUser(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [devMode]);

  return { user, loading };
}
