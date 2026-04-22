import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useDevMode } from '@/contexts/DevModeContext';
import { LoginPage } from '@/pages/LoginPage';
import { PricingPage } from '@/pages/PricingPage';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { status, loading: subLoading } = useSubscription();
  const { devMode } = useDevMode();

  // Unified loading screen alinged with user's request for progress bar during startup
  if (authLoading || (subLoading && !devMode)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <span className="text-4xl">🌿</span>
          </div>
          <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-tight">
            carregando a aplicação. Aguarde.
          </p>
        </div>
        
        <div className="w-full max-w-[240px] h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-full gradient-primary"
          />
        </div>
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
