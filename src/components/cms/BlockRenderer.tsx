'use client';

import { ContentBlock } from '@prisma/client';
import { sanitizeRichText, sanitizeCustomHTML } from '@/lib/sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState, useRef, useLayoutEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import WaveformPlayer from '@/components/audio/WaveformPlayer';
import InlineLanguageSwitcher from './InlineLanguageSwitcher';
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

// Audio Block Component to handle state properly
function AudioBlockRenderer({ block, audioData }: { block: ContentBlock; audioData: AudioEmbedData }) {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    if (audioData.enableLanguageSwitch && audioData.languages && audioData.languages.length > 0) {
      return audioData.languages.find(lang => lang.isDefault) || audioData.languages[0];
    }
    return null;
  });

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

  // Platform-specific iframe embeds (CORS restrictions prevent direct audio loading)
  const renderPlatformEmbed = () => {
    if (currentAudioType === 'spotify' && currentAudioUrl) {
      // Spotify supports dark mode via theme parameter (0 = dark, 1 = light)
      const embedUrl = currentAudioUrl.replace('open.spotify.com', 'open.spotify.com/embed');
      const themeParam = audioData.theme === 'light' ? '&theme=1' : '&theme=0';
      const separator = embedUrl.includes('?') ? '' : '?';

      return (
        <iframe
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
      />
    );
  };

  return (
    <div key={block.id} className="my-8">
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
  );
}

// Mermaid Chart Renderer Component
function MermaidRenderer({ code }: { code: string }) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!code || !mermaidRef.current) return;

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
          }
        });

        const { svg } = await mermaid.render('mermaid-' + Math.random().toString(36).substr(2, 9), code);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error('[MermaidRenderer] Rendering error:', error);
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="text-red-400">Error rendering diagram</div>`;
        }
      }
    };

    renderMermaidDiagram();
  }, [code]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div ref={mermaidRef} className="flex justify-center items-center min-h-[300px]" />
    </div>
  );
}

// D3 Chart Renderer Component
function D3Renderer({ code }: { code: string }) {
  const d3Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!code || !d3Ref.current) return;

    const executeD3Code = async () => {
      try {
        const d3 = await import('d3');
        const container = d3Ref.current;
        if (!container) return;

        container.innerHTML = '';

        // Check if code contains HTML/SVG markup with script tags
        const hasHTMLTags = /<[^>]+>/i.test(code);
        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        const hasScriptTags = scriptRegex.test(code);

        if (hasHTMLTags && hasScriptTags) {
          // Code contains HTML with embedded scripts
          // Extract HTML (without script tags) and scripts separately
          const htmlWithoutScripts = code.replace(scriptRegex, '');
          const scripts: string[] = [];
          let match;

          // Reset regex lastIndex
          scriptRegex.lastIndex = 0;
          while ((match = scriptRegex.exec(code)) !== null) {
            scripts.push(match[1]);
          }

          // Render HTML first
          container.innerHTML = htmlWithoutScripts;

          // Execute scripts after a short delay to ensure DOM is ready
          setTimeout(() => {
            scripts.forEach((scriptContent) => {
              try {
                // Create script function with container and d3 context
                const scriptFunc = new Function('container', 'd3', 'document', scriptContent);
                scriptFunc(container, d3, document);
              } catch (error) {
                console.error('[D3Renderer] Script execution error:', error);
              }
            });
          }, 0);
        } else if (hasHTMLTags) {
          // Pure HTML/SVG without scripts
          container.innerHTML = code;
        } else {
          // Pure JavaScript code
          const codeWithContext = `
            const container = arguments[0];
            const d3 = arguments[1];
            ${code}
          `;

          const d3Function = new Function(codeWithContext);
          d3Function(container, d3);
        }
      } catch (error) {
        console.error('[D3Renderer] Execution error:', error);
        if (d3Ref.current) {
          d3Ref.current.innerHTML = `<div class="text-red-400">Error executing D3 code</div>`;
        }
      }
    };

    executeD3Code();
  }, [code]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div ref={d3Ref} className="flex justify-center items-center min-h-[300px]" id="chart" />
    </div>
  );
}

// Chart.js Renderer Component
function ChartJSRenderer({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<unknown>(null);

  useLayoutEffect(() => {
    if (!code || !canvasRef.current) return;

    const executeChartJS = async () => {
      try {
        const ChartJS = (await import('chart.js/auto')).default;

        // Destroy previous chart instance
        if (chartInstanceRef.current && typeof chartInstanceRef.current === 'object' && 'destroy' in chartInstanceRef.current) {
          (chartInstanceRef.current as { destroy: () => void }).destroy();
        }

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

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
      } catch (error) {
        console.error('[ChartJSRenderer] Execution error:', error);
      }
    };

    executeChartJS();

    return () => {
      if (chartInstanceRef.current && typeof chartInstanceRef.current === 'object' && 'destroy' in chartInstanceRef.current) {
        (chartInstanceRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [code]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
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
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        {config?.title && (
          <h3 className="text-xl font-semibold text-white mb-4 text-center">{config.title}</h3>
        )}
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    );
  };

  // Main renderer - detect framework and render accordingly
  if (framework === 'svg' && chartData.code) {
    return (
      <div className="my-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div dangerouslySetInnerHTML={{ __html: chartData.code }} />
        </div>
      </div>
    );
  }

  if (framework === 'mermaid' && chartData.code) {
    return (
      <div className="my-8">
        <MermaidRenderer code={chartData.code} />
      </div>
    );
  }

  if (framework === 'd3' && chartData.code) {
    return (
      <div className="my-8">
        <D3Renderer code={chartData.code} />
      </div>
    );
  }

  if (framework === 'chartjs' && chartData.code) {
    return (
      <div className="my-8">
        <ChartJSRenderer code={chartData.code} />
      </div>
    );
  }

  if (framework === 'recharts' && chartData.code) {
    return (
      <div className="my-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-yellow-400 text-center p-4">
            <p className="mb-2">⚠️ Recharts JSX code detected</p>
            <p className="text-sm text-white/60">Recharts code needs to be rendered as React components. Please use the visual editor or convert to another format.</p>
          </div>
        </div>
      </div>
    );
  }

  if (framework === 'custom') {
    return (
      <div className="my-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="text-white/60 text-center">Custom chart code - framework not detected</div>
        </div>
      </div>
    );
  }

  // Default: Recharts visual editor
  return (
    <div className="my-8">
      {renderRechartsVisual()}
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

        return (
          <div key={block.id} className="my-8">
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
