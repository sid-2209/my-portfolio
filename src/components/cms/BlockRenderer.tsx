import { ContentBlock, BlockType } from '@prisma/client';

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
  type?: 'youtube' | 'vimeo' | 'loom' | 'twitter' | 'other';
  autoplay?: boolean;
  controls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
}

interface CodeBlockData {
  code: string;
  language: string;
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
              dangerouslySetInnerHTML={{ __html: paragraphData.text || 'No content' }}
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
            {HeadingComponent === 'h1' && <h1 className="michroma text-white text-3xl font-bold leading-tight">{headingData.text || 'No heading'}</h1>}
            {HeadingComponent === 'h2' && <h2 className="michroma text-white text-3xl font-bold leading-tight">{headingData.text || 'No heading'}</h2>}
            {HeadingComponent === 'h3' && <h3 className="michroma text-white text-3xl font-bold leading-tight">{headingData.text || 'No heading'}</h3>}
            {HeadingComponent === 'h4' && <h4 className="michroma text-white text-3xl font-bold leading-tight">{headingData.text || 'No heading'}</h4>}
            {HeadingComponent === 'h5' && <h5 className="michroma text-white text-3xl font-bold leading-tight">{headingData.text || 'No heading'}</h5>}
            {HeadingComponent === 'h6' && <h6 className="michroma text-white text-3xl font-bold leading-tight">{headingData.text || 'No heading'}</h6>}
          </div>
        );
      
      case 'IMAGE':
        const imageData = data as ImageData;
        return (
          <div key={block.id} className="my-8">
            {imageData.src ? (
              <div className="text-center">
                <img 
                  src={imageData.src} 
                  alt={imageData.alt || ''} 
                  className="max-w-full h-auto rounded-2xl shadow-lg"
                />
                {imageData.caption && (
                  <p className="text-white/60 text-sm mt-3 italic text-center">
                    {imageData.caption}
                  </p>
                )}
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
        const getEmbedUrl = (url: string, type?: string) => {
          if (!url) return null;

          if (type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
          } else if (type === 'vimeo' || url.includes('vimeo.com')) {
            const regExp = /vimeo.com\/(\d+)/;
            const match = url.match(regExp);
            const videoId = match ? match[1] : null;
            return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
          } else if (type === 'loom' || url.includes('loom.com')) {
            const regExp = /loom.com\/(share|embed)\/([a-zA-Z0-9]+)/;
            const match = url.match(regExp);
            const videoId = match ? match[2] : null;
            return videoId ? `https://www.loom.com/embed/${videoId}` : null;
          }

          return url; // Return as-is for other types
        };

        const embedUrl = getEmbedUrl(videoData.url, videoData.type);
        const aspectRatioMap = {
          '16:9': '56.25%',
          '4:3': '75%',
          '1:1': '100%',
          '21:9': '42.86%'
        };
        const paddingBottom = aspectRatioMap[videoData.aspectRatio || '16:9'];

        return (
          <div key={block.id} className="my-8">
            {embedUrl ? (
              <div className="relative w-full overflow-hidden rounded-2xl bg-black/20 border border-white/10" style={{ paddingBottom }}>
                <iframe
                  src={embedUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-8 bg-white/10 border border-white/30 rounded-2xl text-center">
                <div className="text-white/60 text-sm mb-2 font-medium">[Video Placeholder]</div>
                <div className="text-white/80 text-lg">No video URL provided</div>
              </div>
            )}
          </div>
        );

      case 'CODE_BLOCK':
        const codeData = data as CodeBlockData;
        return (
          <div key={block.id} className="my-8">
            <div className="bg-gray-900 rounded-2xl p-6 border border-white/10">
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
          <div key={block.id} className="my-8">
            <hr className={`border-white/20 ${dividerData.style === 'dashed' ? 'border-dashed' : dividerData.style === 'dotted' ? 'border-dotted' : dividerData.style === 'double' ? 'border-double' : 'border-solid'}`} style={{ borderColor: dividerData.color || '#ffffff' }} />
          </div>
        );
      
      case 'CUSTOM':
        const customData = data as CustomData;
        return (
          <div key={block.id} className="my-8">
            <div dangerouslySetInnerHTML={{ __html: customData.html || '<span class="text-white/60 italic">[No custom content]</span>' }} />
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
