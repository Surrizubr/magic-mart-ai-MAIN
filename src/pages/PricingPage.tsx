import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { LogOut } from 'lucide-react';

export function PricingPage() {
  const { t } = useLanguage();
  const { openCheckout, loading: checkoutLoading } = useSubscriptionContext();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    await openCheckout();
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <WelcomeScreen>
      <div className="space-y-4">
        <button
          onClick={handleCheckout}
          disabled={loading || checkoutLoading}
          className="w-full p-4 rounded-xl bg-[#2D5A27] text-white text-lg font-bold shadow-xl active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading || checkoutLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('processing') || 'Processando...'}
            </>
          ) : (
            t('premiumSubscribe') || 'Assinar'
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-600 font-medium hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('logout') || 'Sair'}
        </button>
      </div>
    </WelcomeScreen>
  );
}
