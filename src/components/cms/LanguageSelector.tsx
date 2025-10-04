"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

interface AudioLanguage {
  id: string;
  label: string;
  url: string;
  type?: 'spotify' | 'soundcloud' | 'apple-music' | 'local' | 'other';
  localAudioUrl?: string;
  mediaId?: string;
  isDefault?: boolean;
}

interface LanguageSelectorProps {
  languages: AudioLanguage[];
  currentLanguage: AudioLanguage | null;
  onLanguageChange: (language: AudioLanguage) => void;
  className?: string;
}

export default function LanguageSelector({
  languages,
  currentLanguage,
  onLanguageChange,
  className = ""
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!languages || languages.length <= 1) {
    return null;
  }

  const current = currentLanguage || languages.find(lang => lang.isDefault) || languages[0];

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-200"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{current.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 min-w-[160px] bg-gray-800 border border-white/20 rounded-lg shadow-xl z-20 overflow-hidden">
            {languages.map((language) => (
              <button
                key={language.id}
                onClick={() => {
                  onLanguageChange(language);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-200 ${
                  current.id === language.id
                    ? 'bg-blue-600 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{language.label}</span>
                  {language.isDefault && (
                    <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded">Default</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
