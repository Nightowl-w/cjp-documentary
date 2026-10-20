'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const PreferencesContext = createContext<UserPreferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences>({
    reducedMotion: false,
    highContrast: false,
    theme: 'dark',
    toggleTheme: () => {},
  });

  useEffect(() => {
    const mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mediaContrast = window.matchMedia('(prefers-contrast: more)');
    const mediaTheme = window.matchMedia('(prefers-color-scheme: light)');

    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || (mediaTheme.matches ? 'light' : 'dark');

    setPrefs({
      reducedMotion: mediaMotion.matches,
      highContrast: mediaContrast.matches,
      theme: initialTheme,
      toggleTheme: () => setPrefs(p => {
        const next = p.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        return { ...p, theme: next };
      }),
    });

    const handleMotion = (e: MediaQueryListEvent) => setPrefs(p => ({ ...p, reducedMotion: e.matches }));
    const handleContrast = (e: MediaQueryListEvent) => setPrefs(p => ({ ...p, highContrast: e.matches }));
    const handleTheme = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setPrefs(p => ({ ...p, theme: e.matches ? 'light' : 'dark' }));
      }
    };

    mediaMotion.addEventListener('change', handleMotion);
    mediaContrast.addEventListener('change', handleContrast);
    mediaTheme.addEventListener('change', handleTheme);

    return () => {
      mediaMotion.removeEventListener('change', handleMotion);
      mediaContrast.removeEventListener('change', handleContrast);
      mediaTheme.removeEventListener('change', handleTheme);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', prefs.theme === 'light');
  }, [prefs.theme]);

  return (
    <PreferencesContext.Provider value={prefs}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}