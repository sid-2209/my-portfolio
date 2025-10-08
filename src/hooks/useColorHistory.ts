import { useState, useEffect, useCallback } from 'react';

interface ColorHistory {
  saved: string[];
  recent: string[];
}

interface ColorStorage {
  textColors: ColorHistory;
  highlightColors: ColorHistory;
}

const STORAGE_KEY = 'richtext-color-history';
const MAX_SAVED_COLORS = 20;
const MAX_RECENT_COLORS = 4;

const DEFAULT_STORAGE: ColorStorage = {
  textColors: { saved: [], recent: [] },
  highlightColors: { saved: [], recent: [] }
};

/**
 * Hook for managing color history (saved and recent colors) with localStorage persistence
 * @param type - 'text' for text colors, 'highlight' for highlight colors
 */
export function useColorHistory(type: 'text' | 'highlight') {
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load colors from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data: ColorStorage = stored ? JSON.parse(stored) : DEFAULT_STORAGE;

      const colorData = type === 'text' ? data.textColors : data.highlightColors;
      setSavedColors(colorData.saved || []);
      setRecentColors(colorData.recent || []);
      setIsLoaded(true);
    } catch (error) {
      console.error('[useColorHistory] Failed to load colors from localStorage:', error);
      setSavedColors([]);
      setRecentColors([]);
      setIsLoaded(true);
    }
  }, [type]);

  // Save to localStorage whenever colors change
  const persistToStorage = useCallback((saved: string[], recent: string[]) => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const data: ColorStorage = stored ? JSON.parse(stored) : DEFAULT_STORAGE;

      if (type === 'text') {
        data.textColors = { saved, recent };
      } else {
        data.highlightColors = { saved, recent };
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[useColorHistory] Failed to save colors to localStorage:', error);
    }
  }, [type]);

  /**
   * Add a color to recent colors (FIFO, max 4)
   * Automatically called when applying a color
   */
  const addToRecent = useCallback((color: string) => {
    setRecentColors(prev => {
      // Remove if already exists
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      // Add to front
      const updated = [color, ...filtered].slice(0, MAX_RECENT_COLORS);
      persistToStorage(savedColors, updated);
      return updated;
    });
  }, [savedColors, persistToStorage]);

  /**
   * Save a color to saved colors (max 20)
   * Returns false if color already exists or limit reached
   */
  const saveColor = useCallback((color: string): boolean => {
    // Check if already saved
    if (savedColors.some(c => c.toLowerCase() === color.toLowerCase())) {
      return false;
    }

    // Check limit
    if (savedColors.length >= MAX_SAVED_COLORS) {
      console.warn('[useColorHistory] Maximum saved colors limit reached');
      return false;
    }

    const updated = [...savedColors, color];
    setSavedColors(updated);
    persistToStorage(updated, recentColors);
    return true;
  }, [savedColors, recentColors, persistToStorage]);

  /**
   * Remove a color from saved colors
   */
  const removeColor = useCallback((color: string) => {
    const updated = savedColors.filter(c => c.toLowerCase() !== color.toLowerCase());
    setSavedColors(updated);
    persistToStorage(updated, recentColors);
  }, [savedColors, recentColors, persistToStorage]);

  /**
   * Clear all recent colors
   */
  const clearRecent = useCallback(() => {
    setRecentColors([]);
    persistToStorage(savedColors, []);
  }, [savedColors, persistToStorage]);

  /**
   * Clear all saved colors
   */
  const clearSaved = useCallback(() => {
    setSavedColors([]);
    persistToStorage([], recentColors);
  }, [recentColors, persistToStorage]);

  /**
   * Apply a color (adds to recent and optionally saves)
   */
  const applyColor = useCallback((color: string, shouldSave: boolean = false) => {
    addToRecent(color);
    if (shouldSave) {
      saveColor(color);
    }
  }, [addToRecent, saveColor]);

  return {
    savedColors,
    recentColors,
    isLoaded,
    saveColor,
    removeColor,
    addToRecent,
    clearRecent,
    clearSaved,
    applyColor
  };
}
