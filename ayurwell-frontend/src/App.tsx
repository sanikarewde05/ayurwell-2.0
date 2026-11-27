import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { setProfile } from './store/slices/authSlice';
import { setResult, clearDoshaState } from './store/slices/doshaSlice';
import { setCurrentPlan, clearDietState } from './store/slices/dietSlice';
import { setSummary, clearAnalyticsState } from './store/slices/analyticsSlice';
import { axiosClient } from './api/axiosClient';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme } from './theme/muiTheme';

import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrakritiQuizPage } from './pages/PrakritiQuizPage';
import { DiseaseDietPlannerPage } from './pages/DiseaseDietPlannerPage';
import { WomensHealthPage } from './pages/WomensHealthPage';
import { ViruddhaCheckerPage } from './pages/ViruddhaCheckerPage';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { SeasonalRitucharyaPage } from './pages/SeasonalRitucharyaPage';
import { RecipeExplorerPage } from './pages/RecipeExplorerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { RemindersPage } from './pages/RemindersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { DatasetExplorerPage } from './pages/DatasetExplorerPage';

export function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // Splash & Onboarding State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Startup Flow: Splash -> Onboarding -> Login/Signup
  // Ensure onboarding is always reachable and testable on app startup,
  // never blocked by old localStorage/sessionStorage flags during development/testing.
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    if (localStorage.getItem('ayurwell_jwt')) {
      return false;
    }
    if (import.meta.env.DEV) {
      return true;
    }
    return !localStorage.getItem('ayurwell_onboarded');
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('ayurwell_onboarded', 'true');
    setShowOnboarding(false);
  };

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Synchronize authenticated user profile, assessment, and diet plan
  useEffect(() => {
    if (!isAuthenticated) return;

    axiosClient.get('/users/profile')
      .then((res) => {
        const profileData = res.data;
        dispatch(setProfile(profileData));

        if (profileData?.profileCompleted) {
          axiosClient.get('/dosha/latest')
            .then((doshaRes) => {
              if (doshaRes.data) {
                dispatch(setResult(doshaRes.data));
              }
            })
            .catch(() => {});

          axiosClient.get('/diet/latest')
            .then((dietRes) => {
              if (dietRes.data) {
                dispatch(setCurrentPlan(dietRes.data));
              }
            })
            .catch(() => {});

          axiosClient.get('/analytics/summary')
            .then((anaRes) => {
              if (anaRes.data) {
                dispatch(setSummary(anaRes.data));
              }
            })
            .catch(() => {});
        } else {
          // New User Flow: clear any stale state and redirect directly to first-time questionnaire
          dispatch(clearDoshaState());
          dispatch(clearDietState());
          dispatch(clearAnalyticsState());
          setActiveTab('dosha');
        }
      })
      .catch((err) => {
        console.error('Failed to sync authenticated user profile:', err);
      });
  }, [isAuthenticated, dispatch]);

  // 1. Display Splash Screen on initial launch (2.8 seconds)
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Display Interactive 4-Step Onboarding Screen (Splash -> Onboarding -> Auth)
  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // 3. Display Authentication Page if user is not logged in
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // 4. Render Dashboard Views for Authenticated Users
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage setActiveTab={setActiveTab} />;
      case 'dosha':
        return <PrakritiQuizPage setActiveTab={setActiveTab} onComplete={() => setActiveTab('dashboard')} />;
      case 'disease-diet':
        return <DiseaseDietPlannerPage />;
      case 'womens-health':
        return <WomensHealthPage />;
      case 'viruddha':
        return <ViruddhaCheckerPage />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'dataset':
        return <DatasetExplorerPage />;
      case 'budget':
        return <BudgetPlannerPage />;
      case 'seasonal':
        return <SeasonalRitucharyaPage />;
      case 'recipes':
        return <RecipeExplorerPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reminders':
        return <RemindersPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
        />

        <div className="flex flex-1 relative">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
          
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl overflow-x-hidden">
            {renderContent()}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
