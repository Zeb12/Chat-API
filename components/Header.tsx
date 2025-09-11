import React, { useState } from 'react';
import type { Session as SupabaseSession } from '@supabase/supabase-js';
import { LogoIcon } from './icons/LogoIcon';
import { supabase } from '../services/geminiService';
import type { AppState } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { MenuIcon } from './icons/MenuIcon';
import { XIcon } from './icons/XIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

interface HeaderProps {
  onGetStarted?: () => void;
  onNavigateHome?: () => void;
  onNavigateToLanding?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToAdmin?: () => void;
  appState: AppState;
  session: SupabaseSession | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onGetStarted, onNavigateHome, onNavigateToLanding, onNavigateToDashboard, onNavigateToAdmin, appState, session, isAdmin, theme, onToggleTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLanding = appState === 'landing';

  const handleSignOut = async () => {
    // FIX: Add a guard to ensure the Supabase client is available before use.
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      window.location.reload();
    }
  };

  const ThemeToggleButton = (
    <button
      onClick={onToggleTheme}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
    </button>
  );

  // Landing Page Header
  if (isLanding) {
    return (
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="container mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" onClick={handleLogoClick} className="-m-1.5 p-1.5 flex items-center space-x-2">
              <LogoIcon className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">ChatBot Pro</span>
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
             <a href="#" onClick={onGetStarted} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Create a Chatbot</a>
             <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Pricing</a>
             {session && (
                <a href="#" onClick={onNavigateHome} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">Dashboard</a>
             )}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-4">
             {session ? (
                 <button
                    onClick={onNavigateHome}
                    className="rounded-md bg-gradient-to-r from-primary-light to-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-primary hover:to-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200"
                >
                    {isAdmin ? 'Go to Admin' : 'Go to Dashboard'} <span aria-hidden="true">&rarr;</span>
                </button>
             ) : (
                <button
                  onClick={onGetStarted}
                  className="rounded-md bg-gradient-to-r from-primary-light to-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-primary hover:to-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200"
                >
                  Get Started <span aria-hidden="true">&rarr;</span>
                </button>
             )}
             {ThemeToggleButton}
          </div>
        </nav>
        {/* Mobile menu, show/hide based on mobileMenuOpen state */}
        {mobileMenuOpen && (
            <div className="lg:hidden animate-fade-in" role="dialog" aria-modal="true">
                <div className="fixed inset-0 z-50" />
                <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:sm:ring-white/10">
                    <div className="flex items-center justify-between">
                        <a href="#" onClick={handleLogoClick} className="-m-1.5 p-1.5 flex items-center space-x-2">
                            <LogoIcon className="w-8 h-8 text-primary" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">ChatBot Pro</span>
                        </a>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10 dark:divide-gray-500/25">
                            <div className="space-y-2 py-6">
                                <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted?.(); setMobileMenuOpen(false); }} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800">Create a Chatbot</a>
                                <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800">Pricing</a>
                                {session && (
                                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigateHome?.(); setMobileMenuOpen(false); }} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800">Dashboard</a>
                                )}
                            </div>
                            <div className="py-6">
                                {session ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => { onNavigateHome?.(); setMobileMenuOpen(false); }}
                                            className="w-full text-left -mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            {isAdmin ? 'Go to Admin' : 'Go to Dashboard'} <span aria-hidden="true">&rarr;</span>
                                        </button>
                                        <button
                                            onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                                            className="w-full text-left -mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { onGetStarted?.(); setMobileMenuOpen(false); }}
                                        className="w-full text-left -mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Get Started <span aria-hidden="true">&rarr;</span>
                                    </button>
                                )}
                            </div>
                            <div className="py-6 flex justify-start">
                                {ThemeToggleButton}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </header>
    );
  }

  // App Header (for Wizard/Results)
  return (
    <header className="bg-surface dark:bg-gray-800 shadow-md dark:shadow-none dark:border-b dark:border-gray-700 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#" onClick={handleLogoClick} className="flex items-center space-x-3">
            <LogoIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              ChatBot Pro
            </h1>
          </a>
          <div className="flex items-center space-x-4">
            {session && (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">{session.user.email}</span>
                
                {isAdmin && appState === 'admin' && (
                  <button
                    onClick={onNavigateToDashboard}
                    className="px-4 py-2 text-sm font-semibold text-primary-dark dark:text-primary-light bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    User View
                  </button>
                )}
                {isAdmin && appState !== 'admin' && (
                   <button
                    onClick={onNavigateToAdmin}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition-colors flex items-center"
                  >
                     <ShieldCheckIcon className="w-5 h-5 mr-2 -ml-1" />
                    Admin View
                  </button>
                )}
                {!isAdmin && appState !== 'dashboard' && (
                  <button
                    onClick={onNavigateToDashboard}
                    className="px-4 py-2 text-sm font-semibold text-primary-dark dark:text-primary-light bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Dashboard
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-semibold text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/80 transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
            {ThemeToggleButton}
          </div>
        </div>
      </div>
    </header>
  );
};