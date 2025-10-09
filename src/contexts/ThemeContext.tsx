'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  fadeEnabled: boolean;
  setFadeEnabled: (enabled: boolean) => void;
  backgroundOpacity: number;
  setBackgroundOpacity: (opacity: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [fadeEnabled, setFadeEnabled] = useState(true);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0); // 0-5 range, default 0 (33% opacity)
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedFade = localStorage.getItem('fadeEnabled');
    const storedOpacity = localStorage.getItem('backgroundOpacity');

    if (storedFade !== null) {
      setFadeEnabled(storedFade === 'true');
    }

    if (storedOpacity !== null) {
      setBackgroundOpacity(parseInt(storedOpacity));
    }
  }, []);

  // Save fadeEnabled to localStorage when value changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('fadeEnabled', fadeEnabled.toString());
    }
  }, [fadeEnabled, mounted]);

  // Save backgroundOpacity to localStorage when value changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('backgroundOpacity', backgroundOpacity.toString());
    }
  }, [backgroundOpacity, mounted]);

  return (
    <ThemeContext.Provider
      value={{
        fadeEnabled,
        setFadeEnabled,
        backgroundOpacity,
        setBackgroundOpacity,
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
