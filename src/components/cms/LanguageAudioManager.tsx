"use client";

import { useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import AudioPicker from '../media/AudioPicker';

interface AudioLanguage {
  id: string;
  label: string;
  url: string;
  type?: 'spotify' | 'soundcloud' | 'apple-music' | 'local' | 'other';
  localAudioUrl?: string;
  mediaId?: string;
  isDefault?: boolean;
}

interface LanguageAudioManagerProps {
  languages: AudioLanguage[];
  onChange: (languages: AudioLanguage[]) => void;
  className?: string;
}

export default function LanguageAudioManager({
  languages = [],
  onChange,
  className = ""
}: LanguageAudioManagerProps) {
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

  const detectAudioType = (url: string): 'spotify' | 'soundcloud' | 'apple-music' | 'other' => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    if (url.includes('music.apple.com') || url.includes('podcasts.apple.com')) return 'apple-music';
    return 'other';
  };

  const addLanguage = () => {
    const newLanguage: AudioLanguage = {
      id: `lang-${Date.now()}`,
      label: '',
      url: '',
      type: 'other',
      isDefault: languages.length === 0
    };
    onChange([...languages, newLanguage]);
    setExpandedLanguage(newLanguage.id);
  };

  const updateLanguage = (id: string, updates: Partial<AudioLanguage>) => {
    const updatedLanguages = languages.map(lang => {
      if (lang.id === id) {
        const updated = { ...lang, ...updates };
        // Auto-detect type if URL changes
        if (updates.url && !updates.type) {
          updated.type = detectAudioType(updates.url);
        }
        return updated;
      }
      return lang;
    });
    onChange(updatedLanguages);
  };

  const removeLanguage = (id: string) => {
    const filtered = languages.filter(lang => lang.id !== id);
    // If we removed the default, make the first language default
    if (filtered.length > 0 && !filtered.some(lang => lang.isDefault)) {
      filtered[0].isDefault = true;
    }
    onChange(filtered);
  };

  const setAsDefault = (id: string) => {
    const updatedLanguages = languages.map(lang => ({
      ...lang,
      isDefault: lang.id === id
    }));
    onChange(updatedLanguages);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-gray-700 text-sm font-medium">
          Multi-Language Audio
        </label>
        <button
          onClick={addLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Language
        </button>
      </div>

      {languages.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm">No languages added yet</p>
          <p className="text-gray-400 text-xs mt-1">Click "Add Language" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map((language) => (
            <div
              key={language.id}
              className="border border-gray-300 rounded-lg bg-white overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 bg-gray-50">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => setExpandedLanguage(expandedLanguage === language.id ? null : language.id)}
                    className="text-left flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {language.label || 'Unnamed Language'}
                      </span>
                      {language.isDefault && (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          <Star className="w-3 h-3" />
                          Default
                        </span>
                      )}
                      {language.type && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded capitalize">
                          {language.type}
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    {!language.isDefault && (
                      <button
                        onClick={() => setAsDefault(language.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Set as default"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeLanguage(language.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove language"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedLanguage === language.id && (
                <div className="p-4 space-y-4 border-t border-gray-200">
                  {/* Language Label */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Language Label *
                    </label>
                    <input
                      type="text"
                      value={language.label}
                      onChange={(e) => updateLanguage(language.id, { label: e.target.value })}
                      placeholder="e.g., English, Spanish, Hindi"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                    />
                  </div>

                  {/* Audio Source Toggle */}
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Audio Source
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateLanguage(language.id, { type: language.type === 'local' ? 'other' : language.type })}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          language.type !== 'local'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        URL Embed
                      </button>
                      <button
                        onClick={() => updateLanguage(language.id, { type: 'local' })}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          language.type === 'local'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-700'
                        }`}
                      >
                        Upload Audio
                      </button>
                    </div>
                  </div>

                  {/* URL or Upload */}
                  {language.type === 'local' ? (
                    <AudioPicker
                      value={language.localAudioUrl}
                      onChange={(media) => {
                        updateLanguage(language.id, {
                          localAudioUrl: media?.blobUrl || '',
                          url: media?.blobUrl || '',
                          mediaId: media?.id,
                          type: 'local'
                        });
                      }}
                      source={`audio-block-lang-${language.id}`}
                      folder="audio-blocks"
                    />
                  ) : (
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Audio URL *
                      </label>
                      <input
                        type="url"
                        value={language.url}
                        onChange={(e) => updateLanguage(language.id, { url: e.target.value })}
                        placeholder="https://open.spotify.com/track/..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported: Spotify, SoundCloud, Apple Music/Podcasts
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {languages.length > 0 && (
        <p className="text-xs text-gray-500">
          {languages.length} language{languages.length !== 1 ? 's' : ''} configured.
          Users will be able to switch between them on the published content.
        </p>
      )}
    </div>
  );
}
