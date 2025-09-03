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
  | CodeBlockData 
  | QuoteData 
  | ListData 
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
            <p className="text-white/80 text-lg leading-relaxed">
              {paragraphData.text || 'No content'}
            </p>
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
