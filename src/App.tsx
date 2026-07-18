import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LandingPage } from "@/components/app/landing/landing-page";
import { LoginPage } from "@/components/app/auth/login-page";
import { RegisterPage } from "@/components/app/auth/register-page";
import { OnboardingFlow } from "@/components/app/onboarding/onboarding-flow";
import { AppLayout } from "@/components/app/layout";
import { DashboardPage } from "@/components/app/dashboard/page";
import { WardrobePage } from "@/components/app/wardrobe/page";
import { OOTDPage } from "@/components/app/ootd/ootd-page";
import { SavedOutfitsPage } from "@/components/app/outfits/saved-fits";
import { SettingsPage } from "@/components/app/settings/settings";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider delayDuration={150}>
          <AppRoutes />
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { email, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="bg-background grid min-h-svh place-items-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={email ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={email ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={email ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />

      <Route
        path="/onboarding"
        element={
          !email ? (
            <Navigate to="/register" replace />
          ) : profile?.onboardingComplete ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <OnboardingFlow />
          )
        }
      />

      <Route
        element={
          !email ? (
            <Navigate to="/login" replace />
          ) : !profile?.onboardingComplete ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <AppLayout />
          )
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/ootd" element={<OOTDPage />} />
        <Route path="/outfits" element={<SavedOutfitsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
