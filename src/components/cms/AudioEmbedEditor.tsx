"use client";

import { useState, useRef, useEffect } from "react";
import AudioPicker from '../media/AudioPicker';
import LanguageAudioManager from './LanguageAudioManager';

interface AudioLanguage {
  id: string;
  label: string;
  url: string;
  type?: 'spotify' | 'soundcloud' | 'apple-music' | 'local' | 'other';
  localAudioUrl?: string;
  mediaId?: string;
  isDefault?: boolean;
}

interface AudioEmbedData {
  url: string;
  type?: 'spotify' | 'soundcloud' | 'apple-music' | 'local' | 'other';
  title?: string;
  artist?: string;
  autoplay?: boolean;
  loop?: boolean;
  showPlaylist?: boolean;
  theme?: 'light' | 'dark';
  controls?: 'full' | 'minimal';
  alignment?: 'left' | 'center' | 'right' | 'full';
  width?: number;
  borderRadius?: number;
  shadow?: boolean;
  localAudioUrl?: string;
  mediaId?: string;
  coverArt?: string;
  // Multi-language support
  enableLanguageSwitch?: boolean;
  languages?: AudioLanguage[];
  languageSwitchIntro?: string;
  languageSwitchOutro?: string;
}

interface AudioEmbedEditorProps {
  data: AudioEmbedData;
  onChange: (data: AudioEmbedData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function AudioEmbedEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: AudioEmbedEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<AudioEmbedData>(data);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'url' | 'upload'>(data.type === 'local' ? 'upload' : 'url');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const detectAudioType = (url: string): 'spotify' | 'soundcloud' | 'apple-music' | 'other' => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('soundcloud.com')) return 'soundcloud';
    if (url.includes('music.apple.com') || url.includes('podcasts.apple.com')) return 'apple-music';
    return 'other';
  };

  const handleChange = (field: keyof AudioEmbedData, value: string | boolean | number) => {
    const newData = { ...currentData, [field]: value };
    if (field === 'url') {
      newData.type = detectAudioType(value as string);
    }
    setCurrentData(newData);
    setIsTyping(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the onChange call
    timeoutRef.current = setTimeout(() => {
      onChange(newData);
      setIsTyping(false);
    }, 300);
  };

  if (!mounted) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">Audio/Podcast Block</h3>
        <p className="text-sm text-gray-600 mt-1">Embed audio from Spotify, SoundCloud, or upload your own</p>
      </div>

      {/* Editor Content */}
      <div className="p-4 space-y-4">
        {/* Mode Toggle */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Audio Source
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('url')}
              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                mode === 'url'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
              }`}
            >
              URL Embed
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                mode === 'upload'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
              }`}
            >
              Upload Audio
            </button>
          </div>
        </div>

        {/* URL Input - Only show in URL mode */}
        {mode === 'url' && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Audio URL *
            </label>
            <input
              type="url"
              value={currentData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported: Spotify, SoundCloud, Apple Music/Podcasts
            </p>
          </div>
        )}

        {/* Audio Upload - Only show in upload mode */}
        {mode === 'upload' && (
          <AudioPicker
            value={currentData.localAudioUrl}
            onChange={(media) => {
              const newData = {
                ...currentData,
                localAudioUrl: media?.blobUrl || '',
                url: media?.blobUrl || '',
                mediaId: media?.id,
                type: 'local' as const
              };
              setCurrentData(newData);
              onChange(newData);
            }}
            source="audio-block"
            folder="audio-blocks"
          />
        )}

        {/* Audio Type Display */}
        {currentData.type && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Detected:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize font-medium">
              {currentData.type}
            </span>
          </div>
        )}

        {/* Metadata Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={currentData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Track/Podcast Title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Artist/Creator
            </label>
            <input
              type="text"
              value={currentData.artist || ''}
              onChange={(e) => handleChange('artist', e.target.value)}
              placeholder="Artist Name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
            />
          </div>
        </div>

        {/* Cover Art URL */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Cover Art URL (Optional)
          </label>
          <input
            type="url"
            value={currentData.coverArt || ''}
            onChange={(e) => handleChange('coverArt', e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
          />
        </div>

        {/* Controls Style */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Controls Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['full', 'minimal'] as const).map((style) => (
              <button
                key={style}
                onClick={() => handleChange('controls', style)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  (currentData.controls || 'full') === style
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="capitalize">{style}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['dark', 'light'] as const).map((theme) => (
              <button
                key={theme}
                onClick={() => handleChange('theme', theme)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  (currentData.theme || 'dark') === theme
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="capitalize">{theme}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500 space-y-0.5">
            <p>✅ <span className="font-medium">Spotify:</span> Full dark mode support</p>
            <p>⚠️ <span className="font-medium">SoundCloud:</span> Play button color only</p>
            <p>❌ <span className="font-medium">Apple Music:</span> Theme not supported</p>
          </div>
        </div>

        {/* Alignment Options */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Alignment
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['left', 'center', 'right', 'full'] as const).map((align) => (
              <button
                key={align}
                onClick={() => handleChange('alignment', align)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  (currentData.alignment || 'center') === align
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="capitalize">{align}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Width Control */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Width: {currentData.width || 100}%
          </label>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={currentData.width || 100}
            onChange={(e) => handleChange('width', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Styling Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Border Radius: {currentData.borderRadius || 0}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={currentData.borderRadius || 0}
              onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex items-end pb-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentData.shadow || false}
                onChange={(e) => handleChange('shadow', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Add Shadow</span>
            </label>
          </div>
        </div>

        {/* Playback Options */}
        <div className="flex items-center gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentData.autoplay || false}
              onChange={(e) => handleChange('autoplay', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Autoplay</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentData.loop || false}
              onChange={(e) => handleChange('loop', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Loop</span>
          </label>

          {currentData.type === 'spotify' && (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentData.showPlaylist || false}
                onChange={(e) => handleChange('showPlaylist', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Show Playlist</span>
            </label>
          )}
        </div>

        {/* Multi-Language Toggle */}
        <div className="pt-4 border-t border-gray-200">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentData.enableLanguageSwitch || false}
              onChange={(e) => {
                const isEnabled = e.target.checked;

                if (isEnabled && (currentData.url || currentData.localAudioUrl)) {
                  // Auto-migrate existing audio to languages array as the first language
                  const existingLanguages = currentData.languages || [];

                  // Check if we already have this audio in languages
                  const hasOriginalInLanguages = existingLanguages.some(
                    lang => lang.url === currentData.url || lang.localAudioUrl === currentData.localAudioUrl
                  );

                  if (!hasOriginalInLanguages) {
                    const originalLanguage = {
                      id: `lang-original-${Date.now()}`,
                      label: 'Original',
                      url: currentData.url || '',
                      type: currentData.type,
                      localAudioUrl: currentData.localAudioUrl,
                      mediaId: currentData.mediaId,
                      isDefault: true
                    };

                    // Set other languages as non-default
                    const updatedLanguages = [originalLanguage, ...existingLanguages.map(lang => ({ ...lang, isDefault: false }))];

                    const newData = {
                      ...currentData,
                      enableLanguageSwitch: true,
                      languages: updatedLanguages
                    };
                    setCurrentData(newData);
                    onChange(newData);
                    return;
                  }
                }

                handleChange('enableLanguageSwitch', isEnabled);
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 font-medium">Enable Multi-Language Audio</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            {currentData.enableLanguageSwitch
              ? 'Your original audio has been added as the first language. Add more languages below.'
              : 'Allow users to switch between different language versions of this audio'}
          </p>
        </div>

        {/* Language Manager */}
        {currentData.enableLanguageSwitch && (
          <>
            {/* Intro/Outro Text Fields */}
            <div className="space-y-3 pt-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Intro Text
                </label>
                <input
                  type="text"
                  value={currentData.languageSwitchIntro || ''}
                  onChange={(e) => handleChange('languageSwitchIntro', e.target.value)}
                  placeholder="e.g., Catch our podcast in"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Text shown before language options (default: &quot;Listen in&quot;)
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Outro Text
                </label>
                <input
                  type="text"
                  value={currentData.languageSwitchOutro || ''}
                  onChange={(e) => handleChange('languageSwitchOutro', e.target.value)}
                  placeholder="e.g., — tune in now!"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Text shown after language options (optional)
                </p>
              </div>
            </div>

            <LanguageAudioManager
              languages={currentData.languages || []}
              onChange={(languages) => {
                const newData = { ...currentData, languages };
                setCurrentData(newData);
                onChange(newData);
              }}
            />
          </>
        )}

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {currentData.url ? `Ready to embed ${currentData.type || 'audio'}` : 'Enter an audio URL or upload a file to get started'}
          </div>
          {isTyping && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
