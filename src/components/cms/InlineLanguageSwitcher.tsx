"use client";

interface AudioLanguage {
  id: string;
  label: string;
  url: string;
  type?: 'spotify' | 'soundcloud' | 'apple-music' | 'local' | 'other';
  localAudioUrl?: string;
  mediaId?: string;
  isDefault?: boolean;
}

interface InlineLanguageSwitcherProps {
  languages: AudioLanguage[];
  currentLanguage: AudioLanguage | null;
  onLanguageChange: (language: AudioLanguage) => void;
  introText?: string;
  outroText?: string;
  className?: string;
}

export default function InlineLanguageSwitcher({
  languages,
  currentLanguage,
  onLanguageChange,
  introText = "Listen in",
  outroText = "",
  className = ""
}: InlineLanguageSwitcherProps) {
  if (!languages || languages.length === 0) {
    return null;
  }

  // Sort languages: default first, then others
  const sortedLanguages = [...languages].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  const current = currentLanguage || languages.find(lang => lang.isDefault) || languages[0];

  // Generate display label for each language
  const getDisplayLabel = (language: AudioLanguage, index: number) => {
    // If label is provided, use it
    if (language.label && language.label.trim()) {
      return language.label;
    }
    // Otherwise, use a default based on position
    return `Language ${index + 1}`;
  };

  return (
    <div className={`text-center ${className}`}>
      <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed">
        {introText && <span>{introText} </span>}
        {sortedLanguages.map((language, index) => (
          <span key={language.id}>
            <button
              onClick={() => onLanguageChange(language)}
              className={`underline decoration-2 underline-offset-4 transition-all duration-200 ${
                current.id === language.id
                  ? 'font-semibold'
                  : 'text-white/80 decoration-white/40 hover:text-white hover:decoration-white/60'
              }`}
              style={current.id === language.id ? {
                background: 'linear-gradient(0.25turn, #f1a7b1, #f3c6b4, #f5e7c2, #b7e1b7, #87c4e3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textDecorationColor: '#f1a7b1'
              } : {}}
            >
              {getDisplayLabel(language, index)}
            </button>
            {index < sortedLanguages.length - 1 && <span className="text-white/70">, </span>}
          </span>
        ))}
        {outroText && <span> {outroText}</span>}
      </p>
    </div>
  );
}
