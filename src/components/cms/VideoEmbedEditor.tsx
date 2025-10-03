"use client";

import { useState, useRef, useEffect } from "react";
import VideoPicker from '../media/VideoPicker';

interface VideoEmbedData {
  url: string;
  type?: 'youtube' | 'vimeo' | 'loom' | 'twitter' | 'local' | 'other';
  autoplay?: boolean;
  controls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  alignment?: 'left' | 'center' | 'right' | 'full';
  width?: number;
  borderRadius?: number;
  shadow?: boolean;
  localVideoUrl?: string; // For uploaded videos
  mediaId?: string; // Reference to Media table
}

interface VideoEmbedEditorProps {
  data: VideoEmbedData;
  onChange: (data: VideoEmbedData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function VideoEmbedEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: VideoEmbedEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<VideoEmbedData>(data);
  const [isTyping, setIsTyping] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [mode, setMode] = useState<'url' | 'upload'>(data.type === 'local' ? 'upload' : 'url');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentData(data);
    generateEmbedCode(data);
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const detectVideoType = (url: string): 'youtube' | 'vimeo' | 'loom' | 'twitter' | 'other' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('loom.com')) return 'loom';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    return 'other';
  };

  const extractVideoId = (url: string, type: string): string | null => {
    try {
      if (type === 'youtube') {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      } else if (type === 'vimeo') {
        const regExp = /vimeo.com\/(\d+)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
      } else if (type === 'loom') {
        const regExp = /loom.com\/(share|embed)\/([a-zA-Z0-9]+)/;
        const match = url.match(regExp);
        return match ? match[2] : null;
      }
    } catch (e) {
      console.error('Error extracting video ID:', e);
    }
    return null;
  };

  const generateEmbedCode = (videoData: VideoEmbedData) => {
    if (!videoData.url) {
      setEmbedCode('');
      return;
    }

    const type = videoData.type || detectVideoType(videoData.url);
    const videoId = extractVideoId(videoData.url, type);

    if (!videoId) {
      setEmbedCode('');
      return;
    }

    let code = '';
    const autoplayParam = videoData.autoplay ? '1' : '0';
    const aspectRatio = videoData.aspectRatio || '16:9';
    const paddingBottom = {
      '16:9': '56.25%',
      '4:3': '75%',
      '1:1': '100%',
      '21:9': '42.86%'
    }[aspectRatio];

    switch (type) {
      case 'youtube':
        code = `<div style="position: relative; padding-bottom: ${paddingBottom}; height: 0; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>`;
        break;
      case 'vimeo':
        code = `<div style="position: relative; padding-bottom: ${paddingBottom}; height: 0; overflow: hidden;">
  <iframe
    src="https://player.vimeo.com/video/${videoId}?autoplay=${autoplayParam}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>`;
        break;
      case 'loom':
        code = `<div style="position: relative; padding-bottom: ${paddingBottom}; height: 0; overflow: hidden;">
  <iframe
    src="https://www.loom.com/embed/${videoId}?autoplay=${autoplayParam}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allowfullscreen>
  </iframe>
</div>`;
        break;
      default:
        code = videoData.url;
    }

    setEmbedCode(code);
  };

  const handleChange = (field: keyof VideoEmbedData, value: string | boolean | number) => {
    const newData = { ...currentData, [field]: value };
    if (field === 'url') {
      newData.type = detectVideoType(value as string);
    }
    setCurrentData(newData);
    setIsTyping(true);
    generateEmbedCode(newData);

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
        <h3 className="text-lg font-semibold text-gray-900">Video/Embed Block</h3>
        <p className="text-sm text-gray-600 mt-1">Embed videos from YouTube, Vimeo, Loom, or upload your own</p>
      </div>

      {/* Editor Content */}
      <div className="p-4 space-y-4">
        {/* Mode Toggle */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Video Source
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
              Upload Video
            </button>
          </div>
        </div>

        {/* URL Input - Only show in URL mode */}
        {mode === 'url' && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Video URL *
            </label>
            <input
              type="url"
              value={currentData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported: YouTube, Vimeo, Loom, Twitter/X embeds
            </p>
          </div>
        )}

        {/* Video Upload - Only show in upload mode */}
        {mode === 'upload' && (
          <VideoPicker
            value={currentData.localVideoUrl}
            onChange={(media) => {
              const newData = {
                ...currentData,
                localVideoUrl: media?.blobUrl || '',
                url: media?.blobUrl || '',
                mediaId: media?.id,
                type: 'local' as const
              };
              setCurrentData(newData);
              onChange(newData);
            }}
            source="video-block"
            folder="video-blocks"
          />
        )}

        {/* Video Type Display */}
        {currentData.type && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Detected:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize font-medium">
              {currentData.type}
            </span>
          </div>
        )}

        {/* Aspect Ratio */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Aspect Ratio
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['16:9', '4:3', '1:1', '21:9'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => handleChange('aspectRatio', ratio)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                  (currentData.aspectRatio || '16:9') === ratio
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900'
                }`}
              >
                {ratio}
              </button>
            ))}
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

        {/* Options */}
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
              checked={currentData.controls !== false}
              onChange={(e) => handleChange('controls', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Show Controls</span>
          </label>
        </div>

        {/* Preview */}
        {embedCode && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Preview
            </label>
            <div
              className="border border-gray-200 rounded-lg overflow-hidden bg-black"
              dangerouslySetInnerHTML={{ __html: embedCode }}
            />
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {currentData.url ? `Ready to embed ${currentData.type || 'video'}` : 'Enter a video URL to get started'}
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
