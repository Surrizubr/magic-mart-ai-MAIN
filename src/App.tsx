import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DevModeProvider } from "@/contexts/DevModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { AuthGuard } from "@/components/AuthGuard";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PreferencesProvider>
          <DevModeProvider>
            <LanguageProvider>
              <SubscriptionProvider>
                <TooltipProvider>
                  <Toaster position="top-center" />
                  <BrowserRouter>
                    <AuthGuard>
                      <Routes>
                        <Route path="/" element={<Index />} />
                      </Routes>
                    </AuthGuard>
                  </BrowserRouter>
                </TooltipProvider>
              </SubscriptionProvider>
            </LanguageProvider>
          </DevModeProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
