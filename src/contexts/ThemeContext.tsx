'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  fadeEnabled: boolean;
  setFadeEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [fadeEnabled, setFadeEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedFade = localStorage.getItem('fadeEnabled');

    if (storedFade !== null) {
      setFadeEnabled(storedFade === 'true');
    }
  }, []);

  // Save to localStorage when value changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('fadeEnabled', fadeEnabled.toString());
    }
  }, [fadeEnabled, mounted]);

  return (
    <ThemeContext.Provider
      value={{
        fadeEnabled,
        setFadeEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
