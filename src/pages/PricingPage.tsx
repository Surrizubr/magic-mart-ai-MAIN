import { Crown, Check, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function PricingPage() {
  const { checkout, loading } = useSubscription();
  const { t, language } = useLanguage();
  const currency = language === 'pt' ? 'R$' : '$';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success(t('loggedOut') || 'Desconectado com sucesso');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
        >
          <Crown className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          {t('subBannerTitle') || 'Seja Premium'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
          {t('pricingDesc') || 'Gerencie compras, estoque e gastos com inteligência artificial.'}
        </p>
      </div>

      <div className="w-full max-w-sm bg-card rounded-3xl border border-border p-8 shadow-xl space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4">
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 uppercase">
            Anual
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-4xl font-black text-foreground">
            {currency} 49,90 <span className="text-sm font-medium text-muted-foreground">/ano</span>
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {t('premiumPerYear') || 'Assinatura anual recorrente'}
          </p>
        </div>

        <div className="space-y-4">
          {[
            'Gerenciamento ilimitado',
            'Sincronização em tempo real',
            'Relatórios avançados com IA',
            'Suporte prioritário 24/7'
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <Button 
          onClick={() => checkout()} 
          disabled={loading}
          className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            t('subscribeNow') || 'Assinar Agora'
          )}
        </Button>
      </div>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-destructive transition-colors uppercase tracking-widest pt-4"
      >
        <LogOut className="w-3.5 h-3.5" />
        {t('logout') || 'Sair da Conta'}
      </button>

      <div className="fixed bottom-6 text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest text-center">
        Powered by idapps.com.br
      </div>
    </div>
  );
}
