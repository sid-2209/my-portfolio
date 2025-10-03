'use client';

import { ContentBlock, BlockType } from '@prisma/client';
import { sanitizeRichText, sanitizeCustomHTML } from '@/lib/sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import WaveformPlayer from '@/components/audio/WaveformPlayer';

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
        const audioUrl = audioData.localAudioUrl || audioData.url;

        const audioAlignmentClass =
          audioData.alignment === 'left' ? 'mr-auto' :
          audioData.alignment === 'right' ? 'ml-auto' :
          audioData.alignment === 'full' ? 'w-full' : 'mx-auto';

        const audioWidthStyle = audioData.alignment === 'full'
          ? { width: '100%' }
          : { width: `${audioData.width || 100}%` };

        return (
          <div key={block.id} className="my-8">
            {audioUrl ? (
              <div
                className={`${audioAlignmentClass}`}
                style={audioWidthStyle}
              >
                <WaveformPlayer
                  url={audioUrl}
                  platform={audioData.type}
                  platformUrl={audioData.url}
                  autoplay={audioData.autoplay}
                  loop={audioData.loop}
                />
              </div>
            ) : (
              <div className="p-8 bg-white/10 border border-white/30 rounded-2xl text-center">
                <div className="text-white/60 text-sm mb-2 font-medium">[Audio Placeholder]</div>
                <div className="text-white/80 text-lg">No audio URL provided</div>
              </div>
            )}
          </div>
        );

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

        return (
          <div key={block.id} className="my-8">
            <div
              className={getContainerClasses()}
              dangerouslySetInnerHTML={{
                __html: sanitizeCustomHTML(customData.html || '<p class="text-white/60 italic text-center">No custom HTML content</p>')
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
