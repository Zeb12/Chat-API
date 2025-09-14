import React, { useState } from 'react';
import { supabase } from '../services/geminiService';
import { BotIcon } from './icons/BotIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

const CONFIG_ERROR_MESSAGE = "Authentication failed due to an invalid Supabase API key or URL. This is a configuration issue.\n\n" +
  "Please double-check these in your 'services/geminiService.ts' file:\n" +
  "1. Is `supabaseUrl` exactly correct?\n" +
  "2. Is `supabaseAnonKey` the correct `anon` public key?\n\n" +
  "You can find these values in your Supabase project dashboard under Project Settings > API.";


const SocialButton: React.FC<{ provider: 'google' | 'github'; children: React.ReactNode; onError: (message: string) => void }> = ({ provider, children, onError }) => {
  const handleLogin = async () => {
    // Clear previous errors before attempting to sign in
    onError('');
    if (!supabase) {
      onError("Authentication service is not configured.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
    if (error) {
      console.error(`Error logging in with ${provider}:`, error);
      if (error.message.includes('Invalid API key')) {
        onError(CONFIG_ERROR_MESSAGE);
      } else {
        onError(error.message);
      }
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-colors"
    >
      {children}
    </button>
  );
};

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword' | 'confirmation';

export const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState({ title: '', body: '' });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });
  const [showResend, setShowResend] = useState(false);

  const strengthColors = {
    0: { text: 'text-gray-500', bg: 'bg-gray-200 dark:bg-gray-600' },
    1: { text: 'text-red-500', bg: 'bg-red-500' },
    2: { text: 'text-orange-400', bg: 'bg-orange-400' },
    3: { text: 'text-yellow-500', bg: 'bg-yellow-500' },
    4: { text: 'text-green-500', bg: 'bg-green-500' },
  };
  
  const evaluatePasswordStrength = (password: string) => {
    if (password.length === 0) {
      return { score: 0, label: '' };
    }
    if (password.length < 8) {
      return { score: 1, label: 'Weak (too short)' };
    }

    const validations = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  
    const trueChecks = Object.values(validations).filter(Boolean).length;
    
    switch (trueChecks) {
      case 0:
      case 1:
      case 2:
        return { score: 1, label: 'Weak' };
      case 3:
        return { score: 2, label: 'Medium' };
      case 4:
        return { score: 3, label: 'Strong' };
      case 5:
        return { score: 4, label: 'Very Strong' };
      default:
        return { score: 0, label: '' };
    }
  };

  // FIX: Add a top-level guard. If this component renders when supabase is null,
  // something is wrong with the parent logic, but we can fail gracefully here
  // to prevent a crash within the component.
  if (!supabase) {
    return (
      <div className="w-full max-w-md mx-auto bg-surface dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Configuration Error</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The application is not configured to handle authentication. Please check the setup.</p>
      </div>
    );
  }

  const handleAuthError = (message: string) => {
    setError(message);
  };
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowResend(false);
    setIsLoading(true);

    if (authMode === 'signUp') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) {
        if (error.message.includes('Invalid API key')) {
            setError(CONFIG_ERROR_MESSAGE);
        } else {
            setError(error.message);
        }
      } else {
        setConfirmationMessage({
          title: 'Confirm your email',
          body: `We've sent a confirmation link to ${email}.\nPlease check your inbox (and spam folder!) to complete your registration.`
        });
        setAuthMode('confirmation');
      }
    } else { // 'signIn'
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid API key')) {
            setError(CONFIG_ERROR_MESSAGE);
        } else if (error.message.includes('Email not confirmed')) {
          setError("Your email address has not been confirmed. Please check your inbox for the confirmation link.");
          setShowResend(true);
        } else if (error.message.includes('Invalid login credentials')) {
          setError("Invalid login credentials. Please check your email and password, or try resetting your password.");
        } else {
          setError(error.message);
        }
      }
      // onAuthStateChange in App.tsx will handle successful sign-in
    }
    setIsLoading(false);
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    setError(null);
    setShowResend(false);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
        if (error.message.includes('Invalid API key')) {
            setError(CONFIG_ERROR_MESSAGE);
        } else {
            setError(error.message);
        }
    } else {
      setConfirmationMessage({
        title: 'Confirmation Sent',
        body: `A new confirmation link has been sent to ${email}.\nPlease check your inbox to complete your registration.`
      });
      setAuthMode('confirmation');
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Supabase uses the Site URL from your project's auth settings for the redirect.
    });
    if (error) {
        if (error.message.includes('Invalid API key')) {
            setError(CONFIG_ERROR_MESSAGE);
        } else {
            setError(error.message);
        }
    } else {
        setConfirmationMessage({
            title: 'Check your email',
            body: `A password reset link has been sent to ${email}.\nPlease follow the instructions to reset your password.`
        });
        setAuthMode('confirmation');
    }
    setIsLoading(false);
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setShowResend(false);
    setFullName('');
    // Keep email if switching between signin and forgot password
    if (mode === 'signUp') {
        setEmail('');
    }
    setPassword('');
  };

  if (authMode === 'confirmation') {
    return (
      <div className="w-full max-w-md mx-auto bg-surface dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in text-center">
        <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{confirmationMessage.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          {confirmationMessage.body.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
        </p>
        <button onClick={() => switchMode('signIn')} className="font-semibold text-primary hover:text-primary-dark focus:outline-none">
          &larr; Back to Sign In
        </button>
      </div>
    );
  }

  if (authMode === 'forgotPassword') {
    return (
      <div className="w-full max-w-md mx-auto bg-surface dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in text-center">
        <BotIcon className="w-12 h-12 mx-auto text-primary" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Reset Password</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-lg text-left" role="alert">
            <p className="font-bold">Error</p>
            <p className="text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition"
              placeholder="Email address"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered your password?{' '}
          <button onClick={() => switchMode('signIn')} className="font-semibold text-primary hover:text-primary-dark focus:outline-none">
            Sign In
          </button>
        </p>
      </div>
    );
  }

  const isSignUp = authMode === 'signUp';

  return (
    <div className="w-full max-w-md mx-auto bg-surface dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 animate-fade-in text-center">
      <BotIcon className="w-12 h-12 mx-auto text-primary" />
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">{isSignUp ? 'Create an Account' : 'Welcome Back!'}</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
        {isSignUp ? 'Get started by creating a new account.' : 'Please sign in to manage your chatbots.'}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 text-red-700 dark:text-red-300 rounded-lg text-left" role="alert">
          <p className="font-bold">Authentication Error</p>
          <p className="text-sm whitespace-pre-wrap">{error}</p>
           {showResend && (
            <div className="mt-2 pt-2 border-t border-red-300 dark:border-red-500/30">
              <button
                onClick={handleResendConfirmation}
                disabled={isLoading}
                className="w-full text-left text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-wait"
              >
                Resend confirmation email &rarr;
              </button>
            </div>
          )}
          {error.toLowerCase().includes("provider") && (
             <div className="text-sm mt-2 border-t border-red-300 dark:border-red-500/30 pt-2">
                <p className="font-semibold">How to fix this:</p>
                <p>This error usually means the social sign-in provider isn't correctly configured in your Supabase project.</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Go to your Supabase Dashboard.</li>
                    <li>Navigate to: <code className="text-xs bg-red-200 dark:bg-red-500/20 p-1 rounded">Authentication &gt; Providers</code>.</li>
                    <li>Enable the provider and add your OAuth credentials.</li>
                </ol>
             </div>
          )}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="full-name" className="sr-only">Full Name</label>
            <input
              id="full-name"
              name="full-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition"
              placeholder="Full Name"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (isSignUp) {
                setPasswordStrength(evaluatePasswordStrength(e.target.value));
              }
            }}
            className="mt-1 block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light sm:text-sm transition"
            placeholder="Password"
          />
        </div>

        {isSignUp && password.length > 0 && (
          <div className="mt-2 space-y-1 text-left">
            <div className="grid grid-cols-4 gap-x-1.5">
              <div className={`h-1.5 rounded-full transition-colors ${passwordStrength.score >= 1 ? strengthColors[passwordStrength.score].bg : strengthColors[0].bg}`}></div>
              <div className={`h-1.5 rounded-full transition-colors ${passwordStrength.score >= 2 ? strengthColors[passwordStrength.score].bg : strengthColors[0].bg}`}></div>
              <div className={`h-1.5 rounded-full transition-colors ${passwordStrength.score >= 3 ? strengthColors[passwordStrength.score].bg : strengthColors[0].bg}`}></div>
              <div className={`h-1.5 rounded-full transition-colors ${passwordStrength.score >= 4 ? strengthColors[passwordStrength.score].bg : strengthColors[0].bg}`}></div>
            </div>
             <p className={`text-xs font-medium ${strengthColors[passwordStrength.score].text}`}>
                {passwordStrength.label}
            </p>
          </div>
        )}

        {!isSignUp && (
            <div className="flex items-center justify-end text-sm pt-1">
                <button
                    type="button"
                    onClick={() => switchMode('forgotPassword')}
                    className="font-semibold text-primary hover:text-primary-dark focus:outline-none text-sm p-1 -m-1 rounded-md"
                >
                    Forgot your password?
                </button>
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            isSignUp ? 'Sign Up' : 'Sign In'
          )}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => switchMode(isSignUp ? 'signIn' : 'signUp')} className="font-semibold text-primary hover:text-primary-dark focus:outline-none">
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>

      <div className="my-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface dark:bg-gray-800 text-gray-500 dark:text-gray-400">OR</span>
        </div>
      </div>

      <div className="space-y-4">
        <SocialButton provider="google" onError={handleAuthError}>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.01,35.638,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Sign in with Google
        </SocialButton>
        <SocialButton provider="github" onError={handleAuthError}>
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
          </svg>
          Sign in with GitHub
        </SocialButton>
      </div>
    </div>
  );
};
