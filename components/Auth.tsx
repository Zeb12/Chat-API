import React, { useState, useMemo } from 'react';
import { supabase, setAuthPersistence } from '../services/geminiService';
import { LogoIcon } from './icons/LogoIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { AuthIllustration } from './icons/AuthIllustration';

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
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) {
      console.error(`Error logging in with ${provider}:`, error);
      if (error.message.includes('Invalid API key')) {
        onError(CONFIG_ERROR_MESSAGE);
      } else if (error.message.includes('Provider not enabled')) {
        // This is a common setup error; provide a helpful, explicit message.
        onError(`The ${provider} provider is not enabled in your Supabase project. To fix this, go to your Supabase Dashboard, navigate to the "Authentication" section, then the "Providers" tab, and enable ${provider}.`);
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

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword' | 'confirmation' | 'passwordResetConfirmation';

interface AuthProps {
  initialMode?: 'signIn' | 'signUp';
}

export const Auth: React.FC<AuthProps> = ({ initialMode = 'signIn' }) => {
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    return { hasMinLength, hasNumber, hasSpecialChar, hasUpperCase };
  }, [password]);

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

  const clearMessages = () => {
    setError(null);
    setMessage(null);
  };

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();
    
    if (!supabase) {
      setError("Authentication service is not available.");
      setLoading(false);
      return;
    }

    try {
      if (authMode === 'signIn') {
        setAuthPersistence(rememberMe);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (authMode === 'signUp') {
        if (!isPasswordStrong) {
          throw new Error("Password does not meet all the requirements.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'User',
              status: 'Active',
            }
          }
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link.");
      } else if (authMode === 'forgotPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage("If an account exists, a password reset link has been sent to your email.");
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      if (err.message?.includes("To support social login")) {
        setError("This email is associated with a social login (like Google or GitHub). Please use the social login button to sign in.");
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const StrengthIndicator: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
    <div className={`flex items-center text-xs transition-colors ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
      <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={met ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" : "M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"} clipRule="evenodd" />
      </svg>
      {label}
    </div>
  );

  return (
    <div className="w-full max-w-5xl lg:flex rounded-2xl shadow-2xl overflow-hidden border border-gray-300/30 dark:border-gray-700/30">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <LogoIcon className="h-10 w-auto text-primary" />
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
              {authMode === 'signIn' && 'Sign in to your account'}
              {authMode === 'signUp' && 'Create your account'}
              {authMode === 'forgotPassword' && 'Reset your password'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              {authMode === 'signIn' && (
                <>
                  Not a member?{' '}
                  <button onClick={() => { setAuthMode('signUp'); clearMessages(); }} className="font-semibold text-primary hover:text-primary-dark">
                    Start a 7-week trial
                  </button>
                </>
              )}
              {authMode === 'signUp' && (
                <>
                  Already a member?{' '}
                  <button onClick={() => { setAuthMode('signIn'); clearMessages(); }} className="font-semibold text-primary hover:text-primary-dark">
                    Sign in
                  </button>
                </>
              )}
               {authMode === 'forgotPassword' && (
                <>
                  Remembered your password?{' '}
                  <button onClick={() => { setAuthMode('signIn'); clearMessages(); }} className="font-semibold text-primary hover:text-primary-dark">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="mt-10">
            <div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SocialButton provider="google" onError={setError}>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.519-3.487-11.187-8.264l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.638 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                  Google
                </SocialButton>
                <SocialButton provider="github" onError={setError}>
                    <svg className="w-5 h-5 mr-3 text-gray-800 dark:text-white" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z"></path></svg>
                  GitHub
                </SocialButton>
              </div>

              <div className="relative mt-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white/0 dark:bg-gray-900/0 backdrop-blur-sm px-6 text-gray-900 dark:text-gray-300">Or continue with</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <form onSubmit={handleAuthAction} className="space-y-6">
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Email address</label>
                    <div className="mt-2">
                        <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6" />
                    </div>
                </div>

                {authMode !== 'forgotPassword' && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">Password</label>
                        <div className="mt-2 relative">
                            <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={authMode === 'signIn' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 dark:text-white bg-white dark:bg-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6" />
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                             </button>
                        </div>
                    </div>
                )}
                
                {authMode === 'signUp' && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <StrengthIndicator label="8+ characters" met={passwordStrength.hasMinLength} />
                    <StrengthIndicator label="One number" met={passwordStrength.hasNumber} />
                    <StrengthIndicator label="One special character" met={passwordStrength.hasSpecialChar} />
                    <StrengthIndicator label="One uppercase letter" met={passwordStrength.hasUpperCase} />
                  </div>
                )}

                {authMode === 'signIn' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-gray-900 dark:text-gray-300">Remember me</label>
                    </div>

                    <div className="text-sm">
                      <button type="button" onClick={() => { setAuthMode('forgotPassword'); clearMessages(); }} className="font-semibold text-primary hover:text-primary-dark">
                        Forgot password?
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm" role="alert">
                       <p className="font-bold">Error</p>
                       <p className="whitespace-pre-wrap">{error}</p>
                    </div>
                )}
                {message && (
                    <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-md text-sm" role="status">
                        <p>{message}</p>
                    </div>
                )}

                <div>
                  <button type="submit" disabled={loading || (authMode === 'signUp' && !isPasswordStrong)} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-wait">
                    {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {loading ? 'Processing...' : (authMode === 'signIn' ? 'Sign In' : (authMode === 'signUp' ? 'Create Account' : 'Send Reset Link'))}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
       <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0 h-full w-full flex items-center justify-center p-12">
            <div className="text-center">
                <AuthIllustration className="w-full max-w-md mx-auto drop-shadow-2xl" />
                <h2 className="mt-8 text-3xl font-bold tracking-tight text-white">
                    Automate Support, Elevate Experience
                </h2>
                <p className="mt-4 text-lg text-violet-100">
                    Join thousands of businesses building smarter, faster, and more efficient customer service with AI.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
