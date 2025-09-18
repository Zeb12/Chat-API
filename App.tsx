import React, { useState, useCallback, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CodeSnippet } from './components/CodeSnippet';
import { Auth as AuthComponent } from './components/Auth';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorMessage } from './components/ErrorMessage';
import { ConfigurationNeeded } from './components/ConfigurationNeeded';
import { InitializationError } from './components/InitializationError';
import { StripeErrorModal } from './components/StripeErrorModal';
import { supabase, generateChatbotScript, redirectToCheckout, initializationError, createChatbot } from './services/geminiService';
import { PLANS } from './constants';
import type { ChatbotConfig, AppState } from './types';
import { useDarkMode } from './hooks/useDarkMode';
import { Footer } from './components/Footer';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { PaymentSuccess } from './components/PaymentSuccess';
import { WizardModal } from './components/WizardModal';

const App: React.FC = () => {
  const [theme, toggleTheme] = useDarkMode();

  // Reworked startup logic:
  // The primary check is now for an initialization error. This catches both
  // placeholder values (which now throw a specific error) and invalid
  // user-provided credentials, providing a single, clear point of failure.
  if (initializationError) {
    // If the error message specifically mentions "Action Required", show the detailed configuration guide.
    // This targets the initial placeholder state.
    if (initializationError.includes("Action Required")) {
        return <ConfigurationNeeded />;
    }
    // For all other initialization errors (e.g., invalid URL, network issues), show the generic error screen.
    return <InitializationError error={initializationError} />;
  }


  const [session, setSession] = useState<Session | null>(null);
  const [appState, setAppState] = useState<AppState>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true for session check
  const [error, setError] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingSubscriptionPlanId, setPendingSubscriptionPlanId] = useState<string | null>(null);
  const [isWizardModalOpen, setWizardModalOpen] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'signIn' | 'signUp'>('signIn');
  
  const openWizardModal = useCallback(() => setWizardModalOpen(true), []);
  const closeWizardModal = useCallback(() => setWizardModalOpen(false), []);
  
  // Create a centralized navigation function that scrolls to the top on state change.
  // This resolves an issue where navigating from a scrolled position (like the pricing section)
  // to a new page (like the dashboard) would maintain the old scroll position.
  const navigateTo = useCallback((state: AppState) => {
    setAppState(state);
    window.scrollTo(0, 0);
  }, []);

  // Check for Stripe success redirect on initial load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      navigateTo('payment-success');
      // Clean the URL to avoid showing the success page on refresh or navigation.
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigateTo]);

  useEffect(() => {
    // FIX: Add a guard to ensure supabase is initialized before using it.
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Set loading to true. It will be set to false when the initial session is loaded.
    setIsLoading(true);
    
    // Centralize all authentication state changes and navigation logic here.
    // This is more reliable than using getSession() and onAuthStateChange separately.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const isAdminUser = session?.user?.email === 'zebsnellenbarger60@gmail.com';
      setIsAdmin(isAdminUser);
      
      // Stop loading after the initial session is processed.
      if (_event === 'INITIAL_SESSION') {
          setIsLoading(false);
      }

      if (_event === 'SIGNED_IN') {
        // Handle post-login flow.
        if (pendingSubscriptionPlanId) {
          // If a plan was selected before login, redirect to checkout.
          setIsLoading(true);
          setError(null);
          setStripeError(null);
          redirectToCheckout(pendingSubscriptionPlanId)
            .catch((err: any) => {
              setStripeError(err.message || 'An unknown error occurred while initiating checkout.');
            })
            .finally(() => {
              setIsLoading(false);
              setPendingSubscriptionPlanId(null);
            });
        } else {
          // Otherwise, navigate to the user's dashboard.
          navigateTo(isAdminUser ? 'admin' : 'dashboard');
        }
      } else if (_event === 'SIGNED_OUT') {
        // When signed out, always return to the landing page.
        navigateTo('landing');
      } else if (_event === 'INITIAL_SESSION') {
        // On page load, if a session is found and we are on the landing page,
        // navigate to the appropriate dashboard. This prevents a redirect loop
        // when navigating between authenticated pages like admin and dashboard.
        if (session && appState === 'landing') {
          navigateTo(isAdminUser ? 'admin' : 'dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigateTo, pendingSubscriptionPlanId, appState]);

  const navigateHome = () => {
    navigateTo(session ? (isAdmin ? 'admin' : 'dashboard') : 'landing');
  };

  const handleStart = () => {
    if (session) {
      navigateHome();
    } else {
      setInitialAuthMode('signUp');
      navigateTo('auth');
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (planId.startsWith('prod_')) {
        const plan = PLANS.find(p => p.id === planId);
        const planName = plan ? plan.name : 'Selected';
        const errorMessage = `Stripe Configuration Error for '${planName}' Plan\n\nYou are using a Product ID ('${planId}'), but Stripe Checkout requires a Price ID.\n\nHow to fix this:\n1. Open your Stripe Dashboard and go to the "Products" section.\n2. Click on the product for your '${planName}' plan.\n3. In the "Pricing" section, find and copy the Price ID (it starts with 'price_...').\n4. Open the file 'constants.ts' in your code editor.\n5. Replace the incorrect ID ('${planId}') with the Price ID you just copied.`;
        setStripeError(errorMessage);
        return;
    }
    if (planId.includes('REPLACE_WITH_YOUR')) {
        setStripeError("Configuration Needed in constants.ts: The Stripe Price ID is a placeholder. Please open the `constants.ts` file and replace the placeholder ID with a real Price ID from your Stripe account. See the comments in the file for instructions.");
        return;
    }

    if (!session) {
      // If the user isn't logged in, remember which plan they wanted to buy
      // and then redirect them to the authentication page.
      setInitialAuthMode('signUp');
      setPendingSubscriptionPlanId(planId);
      navigateTo('auth');
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setStripeError(null);
    try {
      await redirectToCheckout(planId);
      // On success, the user is redirected to Stripe, so we don't need to set loading to false here.
    } catch (err: any) {
      setStripeError(err.message || 'An unknown error occurred while initiating checkout.');
      setIsLoading(false); // Set loading to false only on error
    }
  };

  const handleGenerateScript = useCallback(async (config: ChatbotConfig) => {
    if (!session) {
      setError("You must be logged in to generate a script.");
      navigateTo('auth');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);
    try {
      // First, save the new chatbot to the database.
      // This makes it "real" data that will appear on the dashboard.
      await createChatbot(config);

      // Then, generate the embeddable script.
      const script = await generateChatbotScript(config);
      setGeneratedScript(script);
      navigateTo('result');
      closeWizardModal();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [session, navigateTo, closeWizardModal]);
  
  const handleViewScript = useCallback(async (config: ChatbotConfig) => {
    setIsLoading(true);
    setError(null);
    setGeneratedScript(null);
    try {
      // Just generate the script from existing config, don't create a new record.
      const script = await generateChatbotScript(config);
      setGeneratedScript(script);
      navigateTo('result');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [navigateTo]);
  
  const handleResetToDashboard = () => {
    setGeneratedScript(null);
    setError(null);
    navigateTo(isAdmin ? 'admin' : 'dashboard');
  };

  const navigateToLanding = () => navigateTo('landing');
  const navigateToDashboard = () => navigateTo('dashboard');
  const navigateToAdmin = () => navigateTo('admin');
  const navigateToTerms = () => navigateTo('terms');
  const navigateToPrivacy = () => navigateTo('privacy');


  const renderContent = () => {
    if (isLoading && !['landing', 'dashboard', 'admin', 'terms', 'privacy', 'payment-success'].includes(appState)) {
      return (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (appState === 'auth') {
        return <AuthComponent initialMode={initialAuthMode} />;
    }

    switch (appState) {
      case 'result':
        return <CodeSnippet script={generatedScript!} onReset={handleResetToDashboard} />;
      case 'admin':
        return <AdminDashboard session={session!} />;
      case 'dashboard':
        return <Dashboard session={session!} onCreateNewChatbot={openWizardModal} onSubscribe={handleSubscribe} isLoading={isLoading} onViewScript={handleViewScript} />;
      case 'terms':
        return <TermsOfService onBack={navigateHome} />;
      case 'privacy':
        return <PrivacyPolicy onBack={navigateHome} />;
      case 'payment-success':
        return <PaymentSuccess onComplete={navigateHome} />;
      case 'landing':
      default:
        return (
            <>
                <Hero onGetStarted={handleStart} onNavigateToTerms={navigateToTerms} />
                <Features />
                <Pricing onSubscribe={handleSubscribe} isLoading={isLoading} />
            </>
        );
    }
  };
  
  const isLanding = appState === 'landing';
  const isAuth = appState === 'auth';
  const backgroundClass = isLanding || isAuth ? '' : 'bg-slate-50 dark:bg-gray-900';

  return (
    <div className={`min-h-screen font-sans isolate flex flex-col ${isAuth ? '' : 'pt-20'} ${backgroundClass}`}>
      {(isLanding || isAuth) && (
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
            <div className="absolute -top-80 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 animate-blob" style={{ animationDelay: '-2s' }}></div>
            <div className="absolute -top-40 left-1/4 -z-10 h-[30rem] w-[50rem] -translate-x-1/4 rounded-full bg-gradient-to-tr from-[#9089fc] to-[#4f46e5] opacity-20 animate-blob" style={{ animationDelay: '-4s' }}></div>
            <div className="absolute -top-20 right-1/4 -z-10 h-[50rem] w-[50rem] translate-x-1/4 rounded-full bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 animate-blob"></div>
          </div>
        </div>
      )}
      
      {!isAuth && (
          <Header 
            onGetStarted={handleStart} 
            onNavigateHome={navigateHome} 
            onNavigateToLanding={navigateToLanding} 
            onNavigateToDashboard={navigateToDashboard}
            onNavigateToAdmin={navigateToAdmin}
            appState={appState} 
            session={session} 
            theme={theme} 
            onToggleTheme={toggleTheme}
            isAdmin={isAdmin} 
          />
      )}

      <main className={isAuth ? 'flex-grow flex items-center justify-center p-4' : "container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex-grow"}>
        {renderContent()}
      </main>

      {!isAuth && <Footer onNavigateToTerms={navigateToTerms} onNavigateToPrivacy={navigateToPrivacy} />}
      <ErrorMessage error={error} onClear={() => setError(null)} />
      {stripeError && (
        <StripeErrorModal
          error={stripeError}
          onClose={() => setStripeError(null)}
          onNavigateToGuide={() => {
            setStripeError(null);
            // This is a dummy navigation now, consider replacing or removing
            console.log("Navigation to guide is deprecated.");
          }}
        />
      )}
       <WizardModal
        isOpen={isWizardModalOpen}
        onClose={closeWizardModal}
        onGenerate={handleGenerateScript}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
