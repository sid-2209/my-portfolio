"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Monitor, Smartphone, Tablet, RefreshCw } from "lucide-react";
import { sanitizeRichText, sanitizeCustomHTML } from "@/lib/sanitize";
import WaveformPlayer from "@/components/audio/WaveformPlayer";
import LanguageSelector from "./LanguageSelector";

// Import the same interfaces
interface ParagraphData {
  text: string;
}

interface HeadingData {
  text: string;
  level: number;
  anchor?: string;
}

interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  alignment?: 'left' | 'center' | 'right' | 'full';
  width?: number;
  borderRadius?: number;
  shadow?: boolean;
}

interface CodeBlockData {
  code: string;
  language: string;
  filename?: string;
  theme?: 'light' | 'dark';
}

interface QuoteData {
  text: string;
  author?: string;
  source?: string;
}

interface ListData {
  type: 'unordered' | 'ordered';
  items: string[];
}

interface DividerData {
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
  thickness?: number;
  width?: number;
  marginTop?: number;
  marginBottom?: number;
}

interface CustomData {
  html: string;
  containerStyle?: 'default' | 'transparent' | 'outlined' | 'minimal';
  showBackground?: boolean;
  showBorder?: boolean;
  showPadding?: boolean;
  showRounding?: boolean;
}

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
  localVideoUrl?: string;
  mediaId?: string;
}

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
  enableLanguageSwitch?: boolean;
  languages?: AudioLanguage[];
}

type BlockData =
  | ParagraphData
  | HeadingData
  | ImageData
  | VideoEmbedData
  | AudioEmbedData
  | CodeBlockData
  | QuoteData
  | ListData
  | DividerData
  | CustomData;

interface PreviewBlock {
  id: string;
  blockType: string;
  data: unknown;
  order: number;
}

interface LivePreviewPanelProps {
  blocks: PreviewBlock[];
  contentTitle?: string;
  contentDescription?: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  className?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

// Audio Preview Component to handle state properly
function AudioPreviewBlock({ block, audioData }: { block: PreviewBlock; audioData: AudioEmbedData }) {
  const [selectedAudioLang, setSelectedAudioLang] = useState(() => {
    if (audioData.enableLanguageSwitch && audioData.languages && audioData.languages.length > 0) {
      return audioData.languages.find(lang => lang.isDefault) || audioData.languages[0];
    }
    return null;
  });

  const currentPreviewAudioUrl = audioData.enableLanguageSwitch && selectedAudioLang
    ? (selectedAudioLang.localAudioUrl || selectedAudioLang.url)
    : (audioData.localAudioUrl || audioData.url);

  const currentPreviewAudioType = audioData.enableLanguageSwitch && selectedAudioLang
    ? selectedAudioLang.type
    : audioData.type;

  const audioAlignmentClass =
    audioData.alignment === 'left' ? 'mr-auto' :
    audioData.alignment === 'right' ? 'ml-auto' :
    audioData.alignment === 'full' ? 'w-full' : 'mx-auto';

  const audioWidthStyle = audioData.alignment === 'full'
    ? { width: '100%' }
    : { width: `${audioData.width || 100}%` };

  // Show preview for platform embeds
  const renderAudioPreview = () => {
    if (currentPreviewAudioType === 'spotify' || currentPreviewAudioType === 'soundcloud' || currentPreviewAudioType === 'apple-music') {
      return (
        <div className="p-8 border border-white/10 rounded-2xl">
          <div className="text-center text-white/60">
            <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-sm">
              {currentPreviewAudioType === 'spotify' && 'Spotify player will appear on published post'}
              {currentPreviewAudioType === 'soundcloud' && 'SoundCloud player will appear on published post'}
              {currentPreviewAudioType === 'apple-music' && 'Apple Music player will appear on published post'}
            </p>
          </div>
        </div>
      );
    }

    // For local audio, show waveform player
    return (
      <WaveformPlayer
        url={currentPreviewAudioUrl}
        platform={currentPreviewAudioType}
        platformUrl={currentPreviewAudioUrl}
        autoplay={audioData.autoplay}
        loop={audioData.loop}
      />
    );
  };

  return (
    <div key={block.id} className="my-8">
      {currentPreviewAudioUrl ? (
        <div
          className={`${audioAlignmentClass}`}
          style={audioWidthStyle}
        >
          {/* Language Selector */}
          {audioData.enableLanguageSwitch && audioData.languages && audioData.languages.length >= 1 && (
            <div className="mb-4">
              <div className="text-center mb-2">
                <span className="text-white/70 text-sm font-medium">Listen in:</span>
              </div>
              <div className="flex justify-center">
                <LanguageSelector
                  languages={audioData.languages}
                  currentLanguage={selectedAudioLang}
                  onLanguageChange={setSelectedAudioLang}
                />
              </div>
            </div>
          )}

          {renderAudioPreview()}
        </div>
      ) : (
        <div className="p-8 bg-white/10 border border-white/30 rounded-2xl text-center">
          <div className="text-white/60 text-sm mb-2 font-medium">[Audio Placeholder]</div>
          <div className="text-white/80 text-lg">No audio URL provided</div>
        </div>
      )}
    </div>
  );
}

export default function LivePreviewPanel({
  blocks,
  contentTitle = "Untitled Content",
  contentDescription = "",
  isVisible,
  onToggleVisibility,
  className = ""
}: LivePreviewPanelProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-refresh preview when blocks change
  useEffect(() => {
    if (isAutoRefresh) {
      setLastUpdated(new Date());
    }
  }, [blocks, isAutoRefresh]);

  const manualRefresh = () => {
    setLastUpdated(new Date());
  };

  const getViewportStyles = () => {
    switch (viewportSize) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      default:
        return { width: '100%' };
    }
  };

  const getViewportIcon = () => {
    switch (viewportSize) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const renderPreviewBlock = (block: PreviewBlock) => {
    const data = block.data as BlockData;

    switch (block.blockType) {
      case 'PARAGRAPH':
        const paragraphData = data as ParagraphData;
        return (
          <div key={block.id} className="mb-6">
            <div
              className="text-white/80 text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(paragraphData.text || 'No content') }}
            />
          </div>
        );

      case 'HEADING':
        const headingData = data as HeadingData;
        const headingLevel = headingData.level || 2;
        const HeadingComponent = headingLevel === 1 ? 'h1' :
                               headingLevel === 2 ? 'h2' :
                               headingLevel === 3 ? 'h3' :
                               headingLevel === 4 ? 'h4' :
                               headingLevel === 5 ? 'h5' : 'h6';

        const headingStyles = {
          1: "michroma text-white text-3xl md:text-4xl font-bold leading-tight",
          2: "michroma text-white text-2xl md:text-3xl font-bold leading-tight",
          3: "michroma text-white text-xl md:text-2xl font-bold leading-tight",
          4: "michroma text-white text-lg md:text-xl font-bold leading-tight",
          5: "michroma text-white text-base md:text-lg font-bold leading-tight",
          6: "michroma text-white text-sm md:text-base font-bold leading-tight"
        };

        return (
          <div key={block.id} className="mb-6">
            {HeadingComponent === 'h1' && (
              <h1 id={headingData.anchor} className={headingStyles[1]} dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />
            )}
            {HeadingComponent === 'h2' && (
              <h2 id={headingData.anchor} className={headingStyles[2]} dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />
            )}
            {HeadingComponent === 'h3' && (
              <h3 id={headingData.anchor} className={headingStyles[3]} dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />
            )}
            {HeadingComponent === 'h4' && (
              <h4 id={headingData.anchor} className={headingStyles[4]} dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />
            )}
            {HeadingComponent === 'h5' && (
              <h5 id={headingData.anchor} className={headingStyles[5]} dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />
            )}
            {HeadingComponent === 'h6' && (
              <h6 id={headingData.anchor} className={headingStyles[6]} dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />
            )}
          </div>
        );

      case 'IMAGE':
        const imageData = data as ImageData;
        const alignment = imageData.alignment || 'center';
        const width = imageData.width || 100;
        const borderRadius = imageData.borderRadius || 0;
        const shadow = imageData.shadow || false;

        return (
          <div key={block.id} className="my-8">
            {imageData.src ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : alignment === 'full' ? 'stretch' : 'center',
                  width: '100%'
                }}
              >
                <div style={{ width: alignment === 'full' ? '100%' : `${width}%` }}>
                  <img
                    src={imageData.src}
                    alt={imageData.alt || ''}
                    className="w-full h-auto"
                    loading="lazy"
                    style={{
                      borderRadius: `${borderRadius}px`,
                      boxShadow: shadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' : 'none'
                    }}
                  />
                  {imageData.caption && (
                    <p
                      className="text-white/60 text-sm mt-3 italic"
                      style={{
                        textAlign: alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'center'
                      }}
                    >
                      {imageData.caption}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white/10 border border-white/30 rounded-2xl text-center">
                <div className="text-white/60 text-sm mb-2 font-medium">[Image Placeholder]</div>
                <div className="text-white/80 text-lg">{imageData.alt || 'No image'}</div>
              </div>
            )}
          </div>
        );

      case 'CODE_BLOCK':
        const codeData = data as CodeBlockData;
        return (
          <div key={block.id} className="my-8">
            <div className="bg-gray-900 rounded-2xl p-4 md:p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white/60 text-sm font-mono">
                  {codeData.language || 'text'}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(codeData.code || '')}
                  className="text-white/40 hover:text-white/60 transition-colors duration-200 text-xs"
                >
                  Copy
                </button>
              </div>
              <pre className="text-white/90 text-sm leading-relaxed overflow-x-auto">
                <code>{codeData.code || '// No code content'}</code>
              </pre>
            </div>
          </div>
        );

      case 'QUOTE':
        const quoteData = data as QuoteData;
        return (
          <div key={block.id} className="my-8">
            <blockquote className="border-l-4 border-blue-400 pl-4 md:pl-6 py-4 bg-white/5 rounded-r-2xl">
              <p className="text-white/90 text-lg md:text-xl italic leading-relaxed mb-3">
                &ldquo;{quoteData.text || 'No quote text'}&rdquo;
              </p>
              {quoteData.author && (
                <cite className="text-white/60 text-base md:text-lg">
                  — {quoteData.author}
                  {quoteData.source && (
                    <span className="text-white/40 text-sm ml-2">
                      ({quoteData.source})
                    </span>
                  )}
                </cite>
              )}
            </blockquote>
          </div>
        );

      case 'LIST':
        const listData = data as ListData;
        const ListTag = listData.type === 'ordered' ? 'ol' : 'ul';
        return (
          <div key={block.id} className="my-6">
            <ListTag className={`${listData.type === 'ordered' ? 'list-decimal' : 'list-disc'} list-inside space-y-2 text-white/80 text-lg`}>
              {(listData.items || []).map((item: string, index: number) => (
                <li key={index} className="leading-relaxed">
                  {item || `Item ${index + 1}`}
                </li>
              ))}
            </ListTag>
          </div>
        );

      case 'DIVIDER':
        const dividerData = data as DividerData;
        const dividerStyle = {
          borderTopStyle: dividerData.style || 'solid',
          borderTopColor: dividerData.color || '#ffffff33',
          borderTopWidth: `${dividerData.thickness || 1}px`,
          width: `${dividerData.width || 100}%`,
          marginTop: `${dividerData.marginTop || 20}px`,
          marginBottom: `${dividerData.marginBottom || 20}px`,
          marginLeft: 'auto',
          marginRight: 'auto'
        };

        return (
          <div key={block.id} className="my-8">
            <hr style={dividerStyle} className="border-0" />
          </div>
        );

      case 'AUDIO_EMBED':
        const audioData = data as AudioEmbedData;
        return <AudioPreviewBlock key={block.id} block={block} audioData={audioData} />;

      case 'VIDEO_EMBED':
        const videoData = data as VideoEmbedData;
        const videoUrl = videoData.localVideoUrl || videoData.url;

        return (
          <div key={block.id} className="my-8">
            {videoUrl ? (
              <div className="text-center text-white/60 py-8 bg-white/5 border border-white/10 rounded-2xl">
                <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">Video player will appear on published post</p>
              </div>
            ) : (
              <div className="p-8 bg-white/10 border border-white/30 rounded-2xl text-center">
                <div className="text-white/60 text-sm mb-2 font-medium">[Video Placeholder]</div>
                <div className="text-white/80 text-lg">No video URL provided</div>
              </div>
            )}
          </div>
        );

      case 'CUSTOM':
        const customData = data as CustomData;

        const getContainerClasses = () => {
          const classes = ['custom-html-block'];

          const showBg = customData.showBackground !== false;
          const showBorder = customData.showBorder !== false;
          const showPadding = customData.showPadding !== false;
          const showRounding = customData.showRounding !== false;

          if (showBg) classes.push('bg-white/5');
          if (showBorder) classes.push('border', 'border-white/10');
          if (showPadding) classes.push('p-6');
          if (showRounding) classes.push('rounded-xl');

          return classes.join(' ');
        };

        return (
          <div key={block.id} className="my-8">
            <div
              className={getContainerClasses()}
              dangerouslySetInnerHTML={{
                __html: sanitizeCustomHTML(customData.html || '<span class="text-white/60 italic">[No custom content]</span>')
              }}
            />
          </div>
        );

      default:
        return (
          <div key={block.id} className="my-6 p-4 bg-white/5 border border-white/20 rounded-lg">
            <p className="text-white/60 text-center">Unknown block type: {block.blockType}</p>
          </div>
        );
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-colors"
        title="Show Live Preview"
      >
        <Eye className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-700 shadow-2xl z-40 flex flex-col ${className}`} style={{ width: '45vw', minWidth: '400px' }}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Eye className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Live Preview</h3>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Viewport Size Controls */}
          <div className="flex items-center bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewportSize('mobile')}
              className={`p-2 rounded ${viewportSize === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportSize('tablet')}
              className={`p-2 rounded ${viewportSize === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportSize('desktop')}
              className={`p-2 rounded ${viewportSize === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`p-2 rounded ${isAutoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
            title={isAutoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw className={`w-4 h-4 ${isAutoRefresh ? 'animate-spin' : ''}`} />
          </button>

          {/* Manual Refresh */}
          {!isAutoRefresh && (
            <button
              onClick={manualRefresh}
              className="p-2 bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
              title="Refresh Preview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {/* Hide Preview */}
          <button
            onClick={onToggleVisibility}
            className="p-2 bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
            title="Hide Preview"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            {getViewportIcon()}
            <span className="capitalize">{viewportSize} View</span>
          </div>
          <div className="text-gray-500 text-xs">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div
          ref={previewRef}
          className="transition-all duration-300 ease-in-out"
          style={getViewportStyles()}
        >
          <div className="p-6 md:p-8">
            {/* Content Header */}
            {contentTitle && (
              <div className="mb-8 text-center">
                <h1 className="michroma text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {contentTitle}
                </h1>
                {contentDescription && (
                  <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                    {contentDescription}
                  </p>
                )}
              </div>
            )}

            {/* Content Blocks */}
            {blocks.length > 0 ? (
              <div className="space-y-6">
                {blocks
                  .sort((a, b) => a.order - b.order)
                  .map(renderPreviewBlock)}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/60 text-lg">No content blocks to preview</p>
                <p className="text-white/40 text-sm mt-2">Start adding blocks to see them here</p>
              </div>
            )}

            {/* Preview Footer */}
            <div className="mt-12 pt-8 border-t border-white/20 text-center">
              <p className="text-white/40 text-sm">
                Live Preview - Updates automatically as you edit
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}