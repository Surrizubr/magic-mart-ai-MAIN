import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDevMode } from '@/contexts/DevModeContext';

export type SubStatus = 'active' | 'expiring' | 'inactive';

export interface SubscriptionInfo {
  stripe_status: string;
  stripe_customer_id: string | null;
  subscription_end: string | null;
  display_name: string | null;
  email: string;
}

interface SubscriptionContextType {
  status: SubStatus;
  loading: boolean;
  info: SubscriptionInfo | null;
  daysUntilExpiry: number;
  openCheckout: () => Promise<void>;
  openPortal: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { devMode } = useDevMode();
  const [status, setStatus] = useState<SubStatus>('inactive');
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);

  const applySubscriptionState = useCallback((profile: SubscriptionInfo | null) => {
    setInfo(profile);

    if (!profile || profile.stripe_status !== 'active' || !profile.subscription_end) {
      setDaysUntilExpiry(0);
      setStatus('inactive');
      return;
    }

    const now = new Date();
    const end = new Date(profile.subscription_end);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysUntilExpiry(diffDays);

    if (diffDays <= 0) {
      setStatus('inactive');
    } else if (diffDays <= 30) {
      setStatus('expiring');
    } else {
      setStatus('active');
    }
  }, []);

  const fetchProfile = useCallback(async (): Promise<SubscriptionInfo | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('stripe_status, stripe_customer_id, subscription_end, display_name, user_id')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      stripe_status: (data as any).stripe_status || 'inactive',
      stripe_customer_id: (data as any).stripe_customer_id,
      subscription_end: (data as any).subscription_end,
      display_name: data.display_name,
      email: user.email || '',
    };
  }, [user]);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      applySubscriptionState(null);
      setLoading(false);
      return;
    }

    if (devMode) {
      setStatus('active');
      setLoading(false);
      return;
    }

    setLoading(true);
    const profile = await fetchProfile();
    applySubscriptionState(profile);
    setLoading(false);
  }, [applySubscriptionState, fetchProfile, user, devMode]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const openCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {},
        headers: { 'apikey': SUPABASE_PUBLISHABLE_KEY || '' }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const openPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {},
        headers: { 'apikey': SUPABASE_PUBLISHABLE_KEY || '' }
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      status,
      loading,
      info,
      daysUntilExpiry,
      openCheckout,
      openPortal,
      refresh: checkSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}
