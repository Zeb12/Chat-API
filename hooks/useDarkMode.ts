
import { useState, useEffect, useCallback } from 'react';

export function useDarkMode(): ['light' | 'dark', () => void] {
  // Use a state for the theme, defaulting to 'light' to avoid SSR issues
  // The effect will correct this to the user's preference on mount.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Effect to set the initial theme based on localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme === 'dark' || (storedTheme === null && prefersDark) ? 'dark' : 'light';
    setTheme(initialTheme);
  }, []);

  // Effect to apply the theme to the DOM and update localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return [theme, toggleTheme];
}
