import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useDevMode } from '@/contexts/DevModeContext';
import { LoginPage } from '@/pages/LoginPage';
import { PricingPage } from '@/pages/PricingPage';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { status, loading: subLoading } = useSubscription();
  const { devMode } = useDevMode();

  if (authLoading || (subLoading && !devMode)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full gradient-primary animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (status !== 'active' && status !== 'expiring' && !devMode) {
    return <PricingPage />;
  }

  return <>{children}</>;
}
