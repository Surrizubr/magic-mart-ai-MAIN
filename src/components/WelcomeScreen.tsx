import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface WelcomeScreenProps {
  isLoading?: boolean;
  children?: ReactNode;
}

export function WelcomeScreen({ isLoading, children }: WelcomeScreenProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{ backgroundImage: 'url("/app_presentation.png")' }}
      />
      
      {/* Overlay for better readability if needed, but the user wanted the photo */}
      <div className="absolute inset-0 bg-black/5 z-10" />

      {/* Content Area */}
      <div className="relative z-20 flex-1 w-full flex flex-col justify-end items-center pb-20 px-6">
        {isLoading ? (
          <div className="w-full max-w-[280px] space-y-4">
            <p className="text-sm font-medium text-center text-slate-800 drop-shadow-sm">
              carregando a aplicação. Aguarde.
            </p>
            <div className="w-full h-2 bg-slate-200/50 backdrop-blur-sm rounded-full overflow-hidden border border-white/20">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-full bg-[#2D5A27]" // Matching the brand green from the image
              />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
