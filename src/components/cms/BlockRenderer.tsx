'use client';

import { ContentBlock } from '@prisma/client';
import { sanitizeRichText, sanitizeCustomHTML } from '@/lib/sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import WaveformPlayer from '@/components/audio/WaveformPlayer';
import InlineLanguageSwitcher from './InlineLanguageSwitcher';
import StickyMiniPlayer from '@/components/audio/StickyMiniPlayer';
import { createPortal } from 'react-dom';
import type WaveSurfer from 'wavesurfer.js';
import { useEmbedAPIs } from '@/hooks/useEmbedAPIs';
import BreakoutContainer from '@/components/ui/BreakoutContainer';
import ChartErrorBoundary from './ChartErrorBoundary';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Import the same interfaces used in BlockEditor for consistency
interface ParagraphData {
  text: string;
}

interface HeadingData {
  text: string;
  level: number;
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
  // Multi-language support
  enableLanguageSwitch?: boolean;
  languages?: AudioLanguage[];
  languageSwitchIntro?: string;
  languageSwitchOutro?: string;
  originalLanguageLabel?: string;
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

interface CalloutData {
  type: 'info' | 'warning' | 'error' | 'success' | 'tip';
  title?: string;
  content: string;
  dismissible?: boolean;
}

interface TableData {
  headers: string[];
  rows: string[][];
  hasHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  alignment?: 'left' | 'center' | 'right';
}

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface ChartData {
  // New universal chart fields
  framework?: 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom';
  code?: string;
  isInteractive?: boolean;
  containerWidth?: 'text' | 'media' | 'full'; // Breakout container width

  // Legacy visual editor fields (backwards compatible)
  chartType?: 'bar' | 'line' | 'area' | 'pie' | 'radar';
  data?: ChartDataPoint[];
  config?: {
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: string[];
    showLegend?: boolean;
    showGrid?: boolean;
    animations?: boolean;
  };
}

interface DividerData {
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
}

interface CustomData {
  html: string;
  containerStyle?: 'default' | 'transparent' | 'outlined' | 'minimal';
  showBackground?: boolean;
  showBorder?: boolean;
  showPadding?: boolean;
  showRounding?: boolean;
  detectedLanguages?: string[];
  allowScripts?: boolean;
  isInteractive?: boolean;
}

// Union type for all possible block data
type BlockData =
  | ParagraphData
  | HeadingData
  | ImageData
  | VideoEmbedData
  | CodeBlockData
  | QuoteData
  | ListData
  | CalloutData
  | TableData
  | DividerData
  | CustomData;

// Enhanced CodeBlock Component with Collapse/Expand functionality
function CodeBlockView({
  codeData,
  codeTheme,
  isDarkTheme
}: {
  codeData: CodeBlockData;
  codeTheme: { [key: string]: React.CSSProperties };
  isDarkTheme: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const codeLines = codeData.code?.split('\n') || [];
  const lineCount = codeLines.length;
  const PREVIEW_LINES = 5;
  const shouldCollapse = lineCount > PREVIEW_LINES;

  const displayedCode = (!isExpanded && shouldCollapse)
    ? codeLines.slice(0, PREVIEW_LINES).join('\n')
    : codeData.code;

  const handleCopyCode = async () => {
    if (codeData.code) {
      await navigator.clipboard.writeText(codeData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-8">
      <div className={`rounded-2xl overflow-hidden border ${isDarkTheme ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
        {/* Enhanced Header with Metadata */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkTheme ? 'bg-gray-800 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            {codeData.filename ? (
              <span className={`text-sm font-mono font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                {codeData.filename}
              </span>
            ) : (
              <span className={`text-sm font-mono ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                untitled
              </span>
            )}

            {codeData.language && (
              <span className={`text-xs px-2 py-1 rounded font-medium ${isDarkTheme ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                {codeData.language}
              </span>
            )}

            <span className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
              copied
                ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                : isDarkTheme
                  ? 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-transparent hover:border-gray-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code Content with Preview/Full View */}
        {codeData.code ? (
          <div className="relative">
            <SyntaxHighlighter
              language={codeData.language || 'text'}
              style={codeTheme}
              showLineNumbers={true}
              customStyle={{
                margin: 0,
                padding: '20px',
                borderRadius: 0,
                fontSize: '14px',
                lineHeight: '1.6',
                background: 'transparent'
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                userSelect: 'none',
                opacity: 0.5
              }}
            >
              {displayedCode}
            </SyntaxHighlighter>

            {/* Fade Overlay when collapsed */}
            {shouldCollapse && !isExpanded && (
              <div
                className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{
                  background: isDarkTheme
                    ? 'linear-gradient(to bottom, transparent, #111827)'
                    : 'linear-gradient(to bottom, transparent, #ffffff)'
                }}
              />
            )}
          </div>
        ) : (
          <div className={`p-8 text-center ${isDarkTheme ? 'text-white/40' : 'text-gray-400'}`}>
            <code className="font-mono text-sm">{'//'} No code content</code>
          </div>
        )}

        {/* Expand/Collapse Footer */}
        {shouldCollapse && codeData.code && (
          <div className={`border-t ${isDarkTheme ? 'border-white/10 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-full px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                isDarkTheme
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {lineCount - PREVIEW_LINES} more {lineCount - PREVIEW_LINES === 1 ? 'line' : 'lines'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface BlockRendererProps {
  blocks: ContentBlock[];
}

// Audio Block Component with Intersection Observer and Multi-Platform Mini Player Support
function AudioBlockRenderer({ block, audioData }: { block: ContentBlock; audioData: AudioEmbedData }) {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (audioData.enableLanguageSwitch && audioData.languages && audioData.languages.length > 0) {
      return audioData.languages.find(lang => lang.isDefault) || audioData.languages[0];
    }
    return null;
  });

  // Load Spotify/SoundCloud APIs
  const { spotifyReady, soundcloudReady, spotifyAPI, soundcloudAPI } = useEmbedAPIs();

  // Mini player state
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [mounted, setMounted] = useState(false);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  // Platform-specific refs
  const wavesurferInstanceRef = useRef<WaveSurfer | null>(null);
  const spotifyIframeRef = useRef<HTMLIFrameElement>(null);
  const soundcloudIframeRef = useRef<HTMLIFrameElement>(null);
  const spotifyControllerRef = useRef<unknown>(null);
  const soundcloudWidgetRef = useRef<unknown>(null);

  // Track mounted state for portal
  useEffect(() => {
    setMounted(true);
    console.log('[AudioBlockRenderer] Component mounted, portal ready');
  }, []);

  // Log showMiniPlayer state changes
  useEffect(() => {
    console.log('[AudioBlockRenderer] showMiniPlayer state changed:', showMiniPlayer);
  }, [showMiniPlayer]);

  const currentAudioUrl = audioData.enableLanguageSwitch && selectedLanguage
    ? (selectedLanguage.localAudioUrl || selectedLanguage.url)
    : (audioData.localAudioUrl || audioData.url);

  const currentAudioType = audioData.enableLanguageSwitch && selectedLanguage
    ? selectedLanguage.type
    : audioData.type;

  const audioAlignmentClass =
    audioData.alignment === 'left' ? 'mr-auto' :
    audioData.alignment === 'right' ? 'ml-auto' :
    audioData.alignment === 'full' ? 'w-full' : 'mx-auto';

  const audioWidthStyle = audioData.alignment === 'full'
    ? { width: '100%' }
    : { width: `${audioData.width || 100}%` };

  // Initialize Spotify Controller
  useEffect(() => {
    if (currentAudioType !== 'spotify' || !spotifyReady || !spotifyAPI || !spotifyIframeRef.current) return;

    console.log('[AudioBlockRenderer] Initializing Spotify controller');

    const embedUrl = currentAudioUrl.replace('open.spotify.com', 'open.spotify.com/embed');

    const options = {
      uri: embedUrl,
    };

    const api = spotifyAPI as {
      createController: (
        iframe: HTMLIFrameElement,
        options: { uri: string },
        callback: (controller: unknown) => void
      ) => void;
    };

    api.createController(
      spotifyIframeRef.current,
      options,
      (EmbedController: unknown) => {
        console.log('[AudioBlockRenderer] Spotify controller created');
        spotifyControllerRef.current = EmbedController;
      }
    );

    return () => {
      if (spotifyControllerRef.current) {
        const controller = spotifyControllerRef.current as { destroy: () => void };
        controller.destroy();
        spotifyControllerRef.current = null;
      }
    };
  }, [currentAudioType, spotifyReady, spotifyAPI, currentAudioUrl]);

  // Initialize SoundCloud Widget
  useEffect(() => {
    if (currentAudioType !== 'soundcloud' || !soundcloudReady || !soundcloudAPI || !soundcloudIframeRef.current) return;

    console.log('[AudioBlockRenderer] Initializing SoundCloud widget');

    const api = soundcloudAPI as {
      Widget: (iframe: HTMLIFrameElement) => unknown;
    };

    const widget = api.Widget(soundcloudIframeRef.current);
    soundcloudWidgetRef.current = widget;

    return () => {
      soundcloudWidgetRef.current = null;
    };
  }, [currentAudioType, soundcloudReady, soundcloudAPI]);

  // Robust position checker - determines if mini player should be visible
  const checkPositionAndUpdateMiniPlayer = useCallback(() => {
    const container = audioContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Element is above viewport (scrolled past going down)
    const isAboveViewport = rect.bottom < 0;

    // Element is in viewport (partially or fully visible)
    const isInViewport = rect.top < viewportHeight && rect.bottom > 0;

    const shouldShowMiniPlayer = isAboveViewport;

    console.log('[AudioBlockRenderer] Position check:', {
      rectTop: rect.top,
      rectBottom: rect.bottom,
      viewportHeight,
      isAboveViewport,
      isInViewport,
      shouldShowMiniPlayer,
      currentState: showMiniPlayer,
    });

    // Only update state if it needs to change (prevent unnecessary re-renders)
    if (shouldShowMiniPlayer !== showMiniPlayer) {
      console.log('[AudioBlockRenderer] Updating showMiniPlayer:', shouldShowMiniPlayer);
      setShowMiniPlayer(shouldShowMiniPlayer);
    }
  }, [showMiniPlayer]);

  // Initial position check on mount
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      console.log('[AudioBlockRenderer] Running initial position check');
      checkPositionAndUpdateMiniPlayer();
    }, 100);

    return () => clearTimeout(timer);
  }, [checkPositionAndUpdateMiniPlayer]);

  // Intersection Observer with multiple thresholds for reliability
  useEffect(() => {
    const container = audioContainerRef.current;
    if (!container) {
      console.log('[AudioBlockRenderer] No container ref - observer not attached');
      return;
    }

    console.log('[AudioBlockRenderer] Attaching robust Intersection Observer');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.log('[AudioBlockRenderer] Intersection callback triggered');
          checkPositionAndUpdateMiniPlayer();
        });
      },
      {
        // Multiple thresholds for more frequent callbacks
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0],
        // No rootMargin - pixel-perfect triggering at viewport boundaries
        rootMargin: '0px',
      }
    );

    observer.observe(container);
    console.log('[AudioBlockRenderer] Observer attached successfully');

    return () => {
      console.log('[AudioBlockRenderer] Disconnecting observer');
      observer.disconnect();
    };
  }, [checkPositionAndUpdateMiniPlayer]);

  // Scroll event fallback for bulletproof reliability
  useEffect(() => {
    const handleScroll = () => {
      checkPositionAndUpdateMiniPlayer();
    };

    // Passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    console.log('[AudioBlockRenderer] Scroll event listener attached');

    return () => {
      window.removeEventListener('scroll', handleScroll);
      console.log('[AudioBlockRenderer] Scroll event listener removed');
    };
  }, [checkPositionAndUpdateMiniPlayer]);

  // Handle expand: scroll back to full player
  const handleExpand = () => {
    if (audioContainerRef.current) {
      audioContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowMiniPlayer(false);
    }
  };

  // Handle close: stop playback and hide mini player
  const handleClose = () => {
    if (currentAudioType === 'local' && wavesurferInstanceRef.current) {
      wavesurferInstanceRef.current.pause();
    } else if (currentAudioType === 'spotify' && spotifyControllerRef.current) {
      spotifyControllerRef.current.pause();
    } else if (currentAudioType === 'soundcloud' && soundcloudWidgetRef.current) {
      soundcloudWidgetRef.current.pause();
    }
    setShowMiniPlayer(false);
  };

  // Callback to receive wavesurfer instance from WaveformPlayer
  const handleWavesurferReady = (instance: WaveSurfer) => {
    wavesurferInstanceRef.current = instance;
  };

  // Platform-specific iframe embeds (CORS restrictions prevent direct audio loading)
  const renderPlatformEmbed = () => {
    if (currentAudioType === 'spotify' && currentAudioUrl) {
      // Spotify supports dark mode via theme parameter (0 = dark, 1 = light)
      const embedUrl = currentAudioUrl.replace('open.spotify.com', 'open.spotify.com/embed');
      const themeParam = audioData.theme === 'light' ? '&theme=1' : '&theme=0';
      const separator = embedUrl.includes('?') ? '' : '?';

      return (
        <iframe
          ref={spotifyIframeRef}
          src={`${embedUrl}${separator}${themeParam}`}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="w-full rounded-2xl"
        />
      );
    }

    if (currentAudioType === 'soundcloud' && currentAudioUrl) {
      // SoundCloud doesn't have full dark mode, but we can customize the play button color
      // White for dark theme, orange for light theme
      const color = audioData.theme === 'light' ? 'ff5500' : 'ffffff';

      return (
        <iframe
          ref={soundcloudIframeRef}
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(currentAudioUrl)}&color=%23${color}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
          className="w-full rounded-2xl"
        />
      );
    }

    if (currentAudioType === 'apple-music' && currentAudioUrl) {
      // Apple Music doesn't support theme parameters in iframe embeds
      return (
        <iframe
          allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
          frameBorder="0"
          height="175"
          style={{ width: '100%', overflow: 'hidden' }}
          sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
          src={currentAudioUrl}
          className="w-full rounded-2xl"
        />
      );
    }

    // For local audio files, use WaveformPlayer
    return (
      <WaveformPlayer
        url={currentAudioUrl}
        platform={currentAudioType}
        platformUrl={currentAudioUrl}
        autoplay={audioData.autoplay}
        loop={audioData.loop}
        onWavesurferReady={handleWavesurferReady}
      />
    );
  };

  return (
    <>
      <div key={block.id} ref={audioContainerRef} className="my-8">
        {currentAudioUrl ? (
          <div
            className={`${audioAlignmentClass}`}
            style={audioWidthStyle}
          >
            {/* Language Selector */}
            {audioData.enableLanguageSwitch && audioData.languages && audioData.languages.length >= 1 && (
              <div className="mb-6">
                <InlineLanguageSwitcher
                  languages={audioData.languages}
                  currentLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                  introText={audioData.languageSwitchIntro}
                  outroText={audioData.languageSwitchOutro}
                />
              </div>
            )}

            {renderPlatformEmbed()}
          </div>
        ) : (
          <div className="p-8 bg-white/10 border border-white/30 rounded-2xl text-center">
            <div className="text-white/60 text-sm mb-2 font-medium">[Audio Placeholder]</div>
            <div className="text-white/80 text-lg">No audio URL provided</div>
          </div>
        )}
      </div>

      {/* Mini Player Portal */}
      {(() => {
        const shouldRenderPortal = mounted && showMiniPlayer && typeof document !== 'undefined';
        console.log('[AudioBlockRenderer] Portal render conditions:', {
          mounted,
          showMiniPlayer,
          documentAvailable: typeof document !== 'undefined',
          shouldRenderPortal,
          audioType: currentAudioType,
        });

        return shouldRenderPortal && createPortal(
          <StickyMiniPlayer
            isVisible={showMiniPlayer}
            audioUrl={currentAudioUrl}
            title={audioData.title}
            artist={audioData.artist}
            coverArt={audioData.coverArt}
            audioType={currentAudioType}
            wavesurferInstance={wavesurferInstanceRef.current}
            spotifyController={spotifyControllerRef.current}
            soundcloudWidget={soundcloudWidgetRef.current}
            onClose={handleClose}
            onExpand={handleExpand}
          />,
          document.body
        );
      })()}
    </>
  );
}

// Mermaid Chart Renderer Component
function MermaidRenderer({ code }: { code: string }) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRenderingRef = useRef(false);

  useLayoutEffect(() => {
    if (!code || !mermaidRef.current || isRenderingRef.current) return;

    isRenderingRef.current = true;
    setIsLoading(true);
    setError(null);

    const renderMermaidDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3b82f6',
            primaryTextColor: '#fff',
            primaryBorderColor: '#60a5fa',
            lineColor: '#94a3b8',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
          },
          securityLevel: 'loose', // Allow more flexibility in diagrams
        });

        // Generate unique ID for this render
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);

        const { svg } = await mermaid.render(id, code);

        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[MermaidRenderer] Rendering error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        setIsLoading(false);

        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `
            <div class="text-red-400 text-center py-4">
              <p class="mb-2">Error rendering Mermaid diagram</p>
              <p class="text-sm text-red-300">${errorMessage}</p>
            </div>
          `;
        }
      } finally {
        isRenderingRef.current = false;
      }
    };

    renderMermaidDiagram();

    return () => {
      isRenderingRef.current = false;
    };
  }, [code]);

  return (
    <div className="backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)] p-6">
      {isLoading && !error && (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-white/60 text-sm">Rendering diagram...</div>
        </div>
      )}
      <div
        ref={mermaidRef}
        className={`flex justify-center items-center min-h-[300px] ${isLoading ? 'hidden' : ''}`}
      />
    </div>
  );
}

// D3 Chart Renderer Component
function D3Renderer({ code }: { code: string }) {
  const d3Ref = useRef<HTMLDivElement>(null);
  const isRenderingRef = useRef(false);
  const cleanupFnRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (!code || !d3Ref.current || isRenderingRef.current) return;

    // Prevent concurrent renders
    isRenderingRef.current = true;

    const executeD3Code = async () => {
      try {
        const d3 = await import('d3');
        const container = d3Ref.current;
        if (!container) {
          isRenderingRef.current = false;
          return;
        }

        // Clean up previous render
        if (cleanupFnRef.current) {
          cleanupFnRef.current();
          cleanupFnRef.current = null;
        }

        // Clear container
        container.innerHTML = '';

        // Detect if this is a full HTML document
        const isFullHTMLDoc = /<!doctype\s+html>/i.test(code) ||
                              /<html[\s>]/i.test(code) ||
                              /<body[\s>]/i.test(code);

        let processedHTML = code;
        let styles = '';

        // Extract and process full HTML documents
        if (isFullHTMLDoc) {
          // Extract content from <body> tag
          const bodyMatch = code.match(/<body[^>]*>([\s\S]*)<\/body>/i);
          if (bodyMatch) {
            processedHTML = bodyMatch[1];
          }

          // Extract and scope <style> tags
          const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
          let styleMatch;
          const extractedStyles: string[] = [];

          while ((styleMatch = styleRegex.exec(processedHTML)) !== null) {
            extractedStyles.push(styleMatch[1]);
          }

          // Remove style tags from HTML
          processedHTML = processedHTML.replace(styleRegex, '');

          // Scope styles to container to prevent global contamination
          if (extractedStyles.length > 0) {
            styles = extractedStyles.map(styleContent => {
              // Replace 'body' selectors with container class
              return styleContent
                .replace(/\bbody\s*\{/gi, '.d3-chart-container {')
                .replace(/\bbody\s+/gi, '.d3-chart-container ')
                // Scope all other selectors
                .split('}')
                .map(rule => {
                  if (!rule.trim()) return '';
                  const hasContainerClass = rule.includes('.d3-chart-container');
                  if (hasContainerClass) return rule + '}';
                  // Scope rule to container
                  const parts = rule.split('{');
                  if (parts.length === 2) {
                    const selector = parts[0].trim();
                    const declaration = parts[1];
                    // Don't scope if already has container class or is a keyframe/media query
                    if (selector.startsWith('@') || selector.includes('.d3-chart-container')) {
                      return rule + '}';
                    }
                    return `.d3-chart-container ${selector} { ${declaration}}`;
                  }
                  return rule + '}';
                })
                .join('\n');
            }).join('\n');
          }
        }

        // Check if code contains script tags
        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        const hasScriptTags = scriptRegex.test(processedHTML);

        // Add scoped container class
        container.classList.add('d3-chart-container');

        if (hasScriptTags) {
          // Extract scripts
          const scripts: string[] = [];
          let match;

          scriptRegex.lastIndex = 0;
          while ((match = scriptRegex.exec(processedHTML)) !== null) {
            scripts.push(match[1]);
          }

          // Remove script tags from HTML
          const htmlWithoutScripts = processedHTML.replace(scriptRegex, '');

          // Inject scoped styles
          if (styles) {
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            container.appendChild(styleEl);
          }

          // Render HTML
          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = htmlWithoutScripts;
          container.appendChild(contentDiv);

          // Execute scripts with container context
          requestAnimationFrame(() => {
            scripts.forEach((scriptContent) => {
              try {
                // Replace document.querySelector/d3.select("body") calls with container-scoped versions
                let scopedScript = scriptContent
                  .replace(/d3\.select\s*\(\s*["']body["']\s*\)/gi, 'd3.select(container)')
                  .replace(/document\.querySelector\s*\(\s*["']body["']\s*\)/gi, 'container')
                  .replace(/document\.querySelectorAll\s*\(\s*["']body["']\s*\)/gi, '[container]');

                // Add comprehensive event handling null checks

                // Pattern 1: event.sourceEvent.target (without parentNode)
                scopedScript = scopedScript.replace(
                  /event\.sourceEvent\.target(?!\.)/g,
                  '(event.sourceEvent?.target || event.target)'
                );

                // Pattern 2: event.sourceEvent.target.parentNode
                scopedScript = scopedScript.replace(
                  /event\.sourceEvent\.target\.parentNode/g,
                  '(event.sourceEvent?.target?.parentNode || event.target?.parentNode)'
                );

                // Pattern 3: event.target.value (for input handlers)
                scopedScript = scopedScript.replace(
                  /event\.target\.value/g,
                  '(event?.target?.value ?? (event.currentTarget?.value || "0"))'
                );

                // Pattern 4: Standalone event.target references
                scopedScript = scopedScript.replace(
                  /\bevent\.target\b(?!\.)/g,
                  '(event?.target || event?.currentTarget)'
                );

                // Wrap entire script in try-catch for runtime errors
                const wrappedScript = `
                  try {
                    ${scopedScript}
                  } catch (err) {
                    // Only log non-event-related errors
                    if (err && !err.message?.includes('Cannot read properties of undefined')) {
                      console.error('[D3 Script Error]:', err);
                    }
                  }
                `;

                // Create script function with container and d3 context
                const scriptFunc = new Function('container', 'd3', 'document', 'window', wrappedScript);
                scriptFunc(container, d3, document, window);
              } catch (error) {
                console.error('[D3Renderer] Script execution error:', error);
              }
            });
            isRenderingRef.current = false;
          });
        } else if (/<[^>]+>/i.test(processedHTML)) {
          // Pure HTML/SVG without scripts
          if (styles) {
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            container.appendChild(styleEl);
          }

          const contentDiv = document.createElement('div');
          contentDiv.innerHTML = processedHTML;
          container.appendChild(contentDiv);
          isRenderingRef.current = false;
        } else {
          // Pure JavaScript code
          const codeWithContext = `
            const container = arguments[0];
            const d3 = arguments[1];
            ${code}
          `;

          const d3Function = new Function(codeWithContext);
          d3Function(container, d3);
          isRenderingRef.current = false;
        }

        // Store cleanup function
        cleanupFnRef.current = () => {
          // Remove all D3 selections and event listeners
          if (container) {
            const selection = d3.select(container);
            selection.selectAll('*').remove();
            selection.on('.', null); // Remove all event listeners
            container.classList.remove('d3-chart-container');
          }
        };
      } catch (error) {
        console.error('[D3Renderer] Execution error:', error);
        if (d3Ref.current) {
          d3Ref.current.innerHTML = `<div class="text-red-400 text-center py-4">
            <p class="mb-2">Error rendering D3 chart</p>
            <p class="text-sm text-red-300">Check console for details</p>
          </div>`;
        }
        isRenderingRef.current = false;
      }
    };

    executeD3Code();

    // Cleanup function
    return () => {
      isRenderingRef.current = false;
      if (cleanupFnRef.current) {
        cleanupFnRef.current();
        cleanupFnRef.current = null;
      }
    };
  }, [code]);

  return (
    <div className="backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)] p-6 overflow-hidden">
      <div
        ref={d3Ref}
        className="flex justify-center items-center min-h-[300px] max-w-full overflow-x-auto"
        id="chart"
        style={{ position: 'relative' }}
      />
    </div>
  );
}

// Chart.js Renderer Component
function ChartJSRenderer({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);
  const isRenderingRef = useRef(false);

  useLayoutEffect(() => {
    if (!code || !canvasRef.current || isRenderingRef.current) return;

    // Prevent concurrent renders
    isRenderingRef.current = true;

    const executeChartJS = async () => {
      try {
        const ChartJS = (await import('chart.js/auto')).default;

        // Destroy previous chart instance and wait for it to complete
        if (chartInstanceRef.current && typeof chartInstanceRef.current === 'object' && 'destroy' in chartInstanceRef.current) {
          (chartInstanceRef.current as { destroy: () => void }).destroy();
          chartInstanceRef.current = null;

          // Wait for next frame to ensure destroy is complete
          await new Promise(resolve => requestAnimationFrame(resolve));
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) {
          isRenderingRef.current = false;
          return;
        }

        const codeWithContext = `
          const ctx = arguments[0];
          const Chart = arguments[1];
          ${code}
        `;

        const chartFunction = new Function(codeWithContext);
        const chartInstance = chartFunction(ctx, ChartJS);

        if (chartInstance) {
          chartInstanceRef.current = chartInstance;
        }

        isRenderingRef.current = false;
      } catch (error) {
        console.error('[ChartJSRenderer] Execution error:', error);
        isRenderingRef.current = false;

        // Show error message on canvas
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx && canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.fillStyle = '#f87171';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Error rendering Chart.js chart', canvasRef.current.width / 2, canvasRef.current.height / 2);
        }
      }
    };

    executeChartJS();

    return () => {
      isRenderingRef.current = false;
      if (chartInstanceRef.current && typeof chartInstanceRef.current === 'object' && 'destroy' in chartInstanceRef.current) {
        (chartInstanceRef.current as { destroy: () => void }).destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [code]);

  return (
    <div className="backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)] p-6">
      <div className="flex justify-center items-center">
        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '400px' }} />
      </div>
    </div>
  );
}

// Chart Block Component with Universal Framework Support
function ChartBlock({ chartData }: { chartData: ChartData }) {
  // Determine which framework to use
  const framework = chartData.framework || (chartData.code ? 'custom' : 'recharts');

  // Recharts Visual Editor Renderer
  const renderRechartsVisual = () => {
    const { chartType, data, config } = chartData;
    const colors = config?.colors || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const commonProps = {
      data: data || [],
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    // Make chart backgrounds transparent to show glassmorphism
    const chartStyle = {
      background: 'transparent'
    };

    const renderChart = () => {
      switch (chartType) {
        case 'bar':
          return (
            <BarChart {...commonProps}>
              {config?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />}
              <XAxis dataKey="name" stroke="#fff" opacity={0.7} label={config?.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -10, fill: '#fff' } : undefined} />
              <YAxis stroke="#fff" opacity={0.7} label={config?.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft', fill: '#fff' } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
              {config?.showLegend && <Legend wrapperStyle={{ color: '#fff' }} />}
              <Bar dataKey="value" fill={colors[0]} animationDuration={config?.animations !== false ? 1000 : 0} />
            </BarChart>
          );

        case 'line':
          return (
            <LineChart {...commonProps}>
              {config?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />}
              <XAxis dataKey="name" stroke="#fff" opacity={0.7} label={config?.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -10, fill: '#fff' } : undefined} />
              <YAxis stroke="#fff" opacity={0.7} label={config?.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft', fill: '#fff' } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
              {config?.showLegend && <Legend wrapperStyle={{ color: '#fff' }} />}
              <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} animationDuration={config?.animations !== false ? 1000 : 0} />
            </LineChart>
          );

        case 'area':
          return (
            <AreaChart {...commonProps}>
              {config?.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />}
              <XAxis dataKey="name" stroke="#fff" opacity={0.7} label={config?.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -10, fill: '#fff' } : undefined} />
              <YAxis stroke="#fff" opacity={0.7} label={config?.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft', fill: '#fff' } : undefined} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
              {config?.showLegend && <Legend wrapperStyle={{ color: '#fff' }} />}
              <Area type="monotone" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} animationDuration={config?.animations !== false ? 1000 : 0} />
            </AreaChart>
          );

        case 'pie':
          return (
            <PieChart>
              <Pie
                data={data || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationDuration={config?.animations !== false ? 1000 : 0}
              >
                {(data || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }} />
              {config?.showLegend && <Legend wrapperStyle={{ color: '#fff' }} />}
            </PieChart>
          );

        default:
          return <div className="text-white/60 text-center">Unsupported chart type: {chartType}</div>;
      }
    };

    return (
      <div className="backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)] p-6">
        {config?.title && (
          <h3 className="text-xl font-semibold text-white mb-4 text-center">{config.title}</h3>
        )}
        <ResponsiveContainer width="100%" height={400} style={chartStyle}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    );
  };

  // Get container width (default to 'media' for charts)
  const containerWidth = chartData.containerWidth || 'media';

  // Main renderer - detect framework and render accordingly
  if (framework === 'svg' && chartData.code) {
    return (
      <div className="my-8">
        <BreakoutContainer width={containerWidth}>
          <ChartErrorBoundary framework="SVG">
            <div className="backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)] p-6">
              <div dangerouslySetInnerHTML={{ __html: chartData.code }} />
            </div>
          </ChartErrorBoundary>
        </BreakoutContainer>
      </div>
    );
  }

  if (framework === 'mermaid' && chartData.code) {
    return (
      <div className="my-8">
        <BreakoutContainer width={containerWidth}>
          <ChartErrorBoundary framework="Mermaid">
            <MermaidRenderer code={chartData.code} />
          </ChartErrorBoundary>
        </BreakoutContainer>
      </div>
    );
  }

  if (framework === 'd3' && chartData.code) {
    return (
      <div className="my-8">
        <BreakoutContainer width={containerWidth}>
          <ChartErrorBoundary framework="D3.js">
            <D3Renderer code={chartData.code} />
          </ChartErrorBoundary>
        </BreakoutContainer>
      </div>
    );
  }

  if (framework === 'chartjs' && chartData.code) {
    return (
      <div className="my-8">
        <BreakoutContainer width={containerWidth}>
          <ChartErrorBoundary framework="Chart.js">
            <ChartJSRenderer code={chartData.code} />
          </ChartErrorBoundary>
        </BreakoutContainer>
      </div>
    );
  }

  if (framework === 'recharts' && chartData.code) {
    return (
      <div className="my-8">
        <BreakoutContainer width={containerWidth}>
          <div className="backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)] p-6">
            <div className="text-yellow-400 text-center p-4">
              <p className="mb-2">⚠️ Recharts JSX code detected</p>
              <p className="text-sm text-white/60">Recharts code needs to be rendered as React components. Please use the visual editor or convert to another format.</p>
            </div>
          </div>
        </BreakoutContainer>
      </div>
    );
  }

  if (framework === 'custom') {
    return (
      <div className="my-8">
        <BreakoutContainer width={containerWidth}>
          <ChartErrorBoundary framework="Custom">
            <div className="backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)] p-6">
              <div className="text-white/60 text-center">Custom chart code - framework not detected</div>
            </div>
          </ChartErrorBoundary>
        </BreakoutContainer>
      </div>
    );
  }

  // Default: Recharts visual editor
  return (
    <div className="my-8">
      <BreakoutContainer width={containerWidth}>
        <ChartErrorBoundary framework="Recharts">
          {renderRechartsVisual()}
        </ChartErrorBoundary>
      </BreakoutContainer>
    </div>
  );
}

// Custom HTML Block with Script Support
function CustomHTMLBlock({ customData }: { customData: CustomData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!customData.allowScripts || !customData.html || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    console.log('[CustomHTMLBlock] Executing scripts for interactive content');

    // Extract scripts from HTML
    const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
    const scripts: string[] = [];
    let match;

    while ((match = scriptRegex.exec(customData.html)) !== null) {
      scripts.push(match[1]);
    }

    if (scripts.length === 0) {
      return;
    }

    console.log('[CustomHTMLBlock] Found', scripts.length, 'script(s) to execute');

    // Defer script execution to ensure DOM is ready
    // Use setTimeout to wait for the dangerouslySetInnerHTML to complete
    const timeoutId = setTimeout(() => {
      // Execute scripts with container context
      // Replace document.getElementById calls with container-scoped queries
      scripts.forEach((scriptContent, index) => {
        try {
          // Replace document.getElementById with container.querySelector
          // This ensures elements are found within the container
          const modifiedScript = scriptContent.replace(
            /document\.getElementById\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g,
            "container.querySelector('#$2')"
          );

          console.log('[CustomHTMLBlock] Executing script', index + 1);
          console.log('[CustomHTMLBlock] Script preview:', modifiedScript.substring(0, 200));

          // Provide both container and document in the function context
          const scriptFunc = new Function('container', 'document', modifiedScript);
          scriptFunc(container, document);
          console.log('[CustomHTMLBlock] Successfully executed script', index + 1);
        } catch (error) {
          console.error('[CustomHTMLBlock] Script execution error:', error);
          console.error('[CustomHTMLBlock] Failed script:', scriptContent.substring(0, 500));
        }
      });
    }, 0);

    // Cleanup function
    return () => {
      console.log('[CustomHTMLBlock] Cleaning up scripts');
      clearTimeout(timeoutId);
    };
  }, [customData.html, customData.allowScripts]);

  // Determine styling based on containerStyle or granular options
  const getContainerClasses = () => {
    const classes = ['custom-html-block'];

    // Apply granular controls (they override preset styles)
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

  // Sanitize HTML - strip scripts as they'll be executed separately via Function()
  const sanitizedHTML = sanitizeCustomHTML(customData.html || '');

  return (
    <div ref={containerRef} className={getContainerClasses()}>
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizedHTML || '<p class="text-white/60 italic text-center">No custom HTML content</p>'
        }}
      />
    </div>
  );
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  const renderBlock = (block: ContentBlock) => {
    const data = block.data as unknown as BlockData;
    
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
        return (
          <div key={block.id} className="mb-6">
            {HeadingComponent === 'h1' && <h1 className="michroma text-white text-3xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />}
            {HeadingComponent === 'h2' && <h2 className="michroma text-white text-3xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />}
            {HeadingComponent === 'h3' && <h3 className="michroma text-white text-3xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />}
            {HeadingComponent === 'h4' && <h4 className="michroma text-white text-3xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />}
            {HeadingComponent === 'h5' && <h5 className="michroma text-white text-3xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />}
            {HeadingComponent === 'h6' && <h6 className="michroma text-white text-3xl font-bold leading-tight" dangerouslySetInnerHTML={{ __html: sanitizeRichText(headingData.text || 'No heading') }} />}
          </div>
        );
      
      case 'IMAGE':
        const imageData = data as ImageData;
        const alignment = imageData.alignment || 'center';
        const width = imageData.width || 100;
        const borderRadius = imageData.borderRadius || 0;
        const shadow = imageData.shadow || false;

        // Determine breakout width based on alignment
        const imageBreakoutWidth = alignment === 'full' ? 'full' : 'media';

        return (
          <div key={block.id} className="my-8">
            <BreakoutContainer width={imageBreakoutWidth}>
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
            </BreakoutContainer>
          </div>
        );

      case 'VIDEO_EMBED':
        const videoData = data as VideoEmbedData;

        // Helper function to extract video ID and generate embed URL
        const getEmbedUrl = (url: string, type?: string, autoplay?: boolean) => {
          if (!url) return null;

          const autoplayParam = autoplay ? '1' : '0';

          if (type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;
            return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}` : null;
          } else if (type === 'vimeo' || url.includes('vimeo.com')) {
            const regExp = /vimeo.com\/(\d+)/;
            const match = url.match(regExp);
            const videoId = match ? match[1] : null;
            return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=${autoplayParam}` : null;
          } else if (type === 'loom' || url.includes('loom.com')) {
            const regExp = /loom.com\/(share|embed)\/([a-zA-Z0-9]+)/;
            const match = url.match(regExp);
            const videoId = match ? match[2] : null;
            return videoId ? `https://www.loom.com/embed/${videoId}?autoplay=${autoplayParam}` : null;
          }

          return url; // Return as-is for other types
        };

        const isLocalVideo = videoData.type === 'local' || videoData.localVideoUrl;
        const videoSource = isLocalVideo ? (videoData.localVideoUrl || videoData.url) : null;
        const isGif = videoSource?.toLowerCase().endsWith('.gif') || false;
        const embedUrl = !isLocalVideo ? getEmbedUrl(videoData.url, videoData.type, videoData.autoplay) : null;

        const aspectRatioMap = {
          '16:9': '56.25%',
          '4:3': '75%',
          '1:1': '100%',
          '21:9': '42.86%'
        };
        const paddingBottom = aspectRatioMap[videoData.aspectRatio || '16:9'];
        const videoAlignment = videoData.alignment || 'center';
        const videoWidth = videoData.width || 100;
        const videoBorderRadius = videoData.borderRadius || 0;
        const videoShadow = videoData.shadow || false;

        // Determine breakout width based on alignment
        const videoBreakoutWidth = videoAlignment === 'full' ? 'full' : 'media';

        return (
          <div key={block.id} className="my-8">
            <BreakoutContainer width={videoBreakoutWidth}>
              {(embedUrl || videoSource) ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: videoAlignment === 'left' ? 'flex-start' : videoAlignment === 'right' ? 'flex-end' : videoAlignment === 'full' ? 'stretch' : 'center',
                    width: '100%'
                  }}
                >
                  <div style={{ width: videoAlignment === 'full' ? '100%' : `${videoWidth}%` }}>
                  {isLocalVideo && videoSource ? (
                    isGif ? (
                      // Render GIF using img tag
                      <div
                        className="relative w-full overflow-hidden bg-black/20 border border-white/10"
                        style={{
                          borderRadius: `${videoBorderRadius}px`,
                          boxShadow: videoShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' : 'none'
                        }}
                      >
                        <img
                          src={videoSource}
                          alt="Animated GIF"
                          className="w-full h-auto"
                          style={{
                            display: 'block',
                            borderRadius: `${videoBorderRadius}px`
                          }}
                        />
                      </div>
                    ) : (
                      // Render local video using HTML5 video tag
                      <div
                        className="relative w-full overflow-hidden bg-black/20 border border-white/10"
                        style={{
                          borderRadius: `${videoBorderRadius}px`,
                          boxShadow: videoShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' : 'none'
                        }}
                      >
                        <video
                          src={videoSource}
                          controls={videoData.controls !== false}
                          autoPlay={videoData.autoplay || false}
                          loop={videoData.autoplay || false}
                          muted={videoData.autoplay || false}
                          className="w-full h-auto"
                          style={{
                            display: 'block',
                            borderRadius: `${videoBorderRadius}px`
                          }}
                        />
                      </div>
                    )
                  ) : (
                    // Render embed iframe
                    <div
                      className="relative w-full overflow-hidden bg-black/20 border border-white/10"
                      style={{
                        paddingBottom,
                        borderRadius: `${videoBorderRadius}px`,
                        boxShadow: videoShadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' : 'none'
                      }}
                    >
                      <iframe
                        src={embedUrl!}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white/10 border border-white/30 rounded-2xl text-center">
                <div className="text-white/60 text-sm mb-2 font-medium">[Video Placeholder]</div>
                <div className="text-white/80 text-lg">No video URL provided</div>
              </div>
            )}
            </BreakoutContainer>
          </div>
        );

      case 'AUDIO_EMBED':
        const audioData = data as AudioEmbedData;
        return <AudioBlockRenderer key={block.id} block={block} audioData={audioData} />;

      case 'CODE_BLOCK':
        const codeData = data as CodeBlockData;
        const codeTheme = codeData.theme === 'light' ? vs : vscDarkPlus;
        const isDarkTheme = codeData.theme !== 'light';

        return <CodeBlockView key={block.id} codeData={codeData} codeTheme={codeTheme} isDarkTheme={isDarkTheme} />;
      
      case 'QUOTE':
        const quoteData = data as QuoteData;
        return (
          <div key={block.id} className="my-8">
            <blockquote className="border-l-4 border-blue-400 pl-6 py-4 bg-white/5 rounded-r-2xl">
              <p className="text-white/90 text-xl italic leading-relaxed mb-3">
                &ldquo;{quoteData.text || 'No quote text'}&rdquo;
              </p>
              {quoteData.author && (
                <cite className="text-white/60 text-lg">
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
                <li key={index}>{item || `Item ${index + 1}`}</li>
              ))}
            </ListTag>
          </div>
        );

      case 'CALLOUT':
        const calloutData = data as CalloutData;
        const calloutStyles = {
          info: {
            bg: 'bg-blue-900/30',
            border: 'border-blue-400/50',
            text: 'text-blue-100',
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-300'
          },
          warning: {
            bg: 'bg-yellow-900/30',
            border: 'border-yellow-400/50',
            text: 'text-yellow-100',
            iconBg: 'bg-yellow-500/20',
            iconColor: 'text-yellow-300'
          },
          error: {
            bg: 'bg-red-900/30',
            border: 'border-red-400/50',
            text: 'text-red-100',
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-300'
          },
          success: {
            bg: 'bg-green-900/30',
            border: 'border-green-400/50',
            text: 'text-green-100',
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-300'
          },
          tip: {
            bg: 'bg-purple-900/30',
            border: 'border-purple-400/50',
            text: 'text-purple-100',
            iconBg: 'bg-purple-500/20',
            iconColor: 'text-purple-300'
          }
        };
        const currentCalloutStyle = calloutStyles[calloutData.type || 'info'];

        return (
          <div key={block.id} className="my-8">
            <div className={`${currentCalloutStyle.bg} ${currentCalloutStyle.border} border rounded-2xl p-6`}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 ${currentCalloutStyle.iconBg} ${currentCalloutStyle.iconColor} p-3 rounded-lg`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  {calloutData.title && (
                    <h4 className={`${currentCalloutStyle.text} font-semibold text-xl mb-2`}>
                      {calloutData.title}
                    </h4>
                  )}
                  <p className={`${currentCalloutStyle.text} text-lg leading-relaxed`}>
                    {calloutData.content || 'No content'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'TABLE':
        const tableData = data as TableData;
        const alignmentClass = {
          left: 'text-left',
          center: 'text-center',
          right: 'text-right'
        }[tableData.alignment || 'left'];

        return (
          <div key={block.id} className="my-8 overflow-x-auto">
            <table className={`w-full ${tableData.bordered !== false ? 'border border-white/20' : ''} rounded-xl overflow-hidden`}>
              {tableData.hasHeader !== false && (
                <thead>
                  <tr className="bg-white/10 border-b-2 border-white/20">
                    {tableData.headers.map((header, index) => (
                      <th
                        key={index}
                        className={`px-4 py-3 font-semibold text-white ${alignmentClass} ${
                          tableData.bordered !== false ? 'border-r border-white/10 last:border-r-0' : ''
                        }`}
                      >
                        {header || `Column ${index + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`${
                      tableData.striped && rowIndex % 2 === 1 ? 'bg-white/5' : ''
                    } ${
                      tableData.bordered !== false ? 'border-b border-white/10 last:border-b-0' : ''
                    }`}
                  >
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-4 py-3 text-white/80 ${alignmentClass} ${
                          tableData.bordered !== false ? 'border-r border-white/10 last:border-r-0' : ''
                        }`}
                      >
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'DIVIDER':
        const dividerData = data as DividerData;
        return (
          <div key={block.id} id={`divider-section-${block.order}`} className="my-8 scroll-mt-20">
            <hr className={`border-white/20 ${dividerData.style === 'dashed' ? 'border-dashed' : dividerData.style === 'dotted' ? 'border-dotted' : dividerData.style === 'double' ? 'border-double' : 'border-solid'}`} style={{ borderColor: dividerData.color || '#ffffff' }} />
          </div>
        );
      
      case 'CUSTOM':
        const customData = data as CustomData;

        return (
          <div key={block.id} className="my-8">
            <CustomHTMLBlock customData={customData} />
          </div>
        );

      case 'CHART':
        const chartData = data as ChartData;

        return (
          <div key={block.id} className="my-8">
            <ChartBlock chartData={chartData} />
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

  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 text-lg">No content blocks to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map(renderBlock)}
    </div>
  );
}
