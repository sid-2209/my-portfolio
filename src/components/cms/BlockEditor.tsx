'use client';

import { useState, useEffect, useMemo } from 'react';
import { ContentBlock } from '@prisma/client';
import BlockTypeIcon from './BlockTypeIcon';
import RichTextEditor from './RichTextEditor';
import SplitViewEditor from './SplitViewEditor';
import CodeBlockEditor from './CodeBlockEditor';
import QuoteEditor from './QuoteEditor';
import ListEditor from './ListEditor';
import DividerEditor from './DividerEditor';
import CustomHTMLEditor from './CustomHTMLEditor';
import { sanitizeRichText } from '../../lib/sanitize';

// Type-safe interfaces for block data
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
  thickness?: number;
  width?: number;
  marginTop?: number;
  marginBottom?: number;
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

interface BlockEditorProps {
  block: ContentBlock;
  onUpdate: (data: BlockData) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function BlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: BlockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BlockData>(block.data as unknown as BlockData);
  const [editorMode, setEditorMode] = useState<'rich' | 'markdown' | 'code'>('rich');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only sync editData when block.data changes from external sources, not during editing
  useEffect(() => {
    if (!isEditing) {
      setEditData(block.data as unknown as BlockData);
    }
  }, [block.data, isEditing]);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(block.data as unknown as BlockData);
    setIsEditing(false);
  };

  // Get the appropriate editor mode for each block type
  const getEditorMode = () => {
    switch (block.blockType) {
      case 'CODE_BLOCK':
        return 'code';
      case 'PARAGRAPH':
      case 'HEADING':
        return 'rich';
      default:
        return 'rich';
    }
  };

  // Render the appropriate advanced editor based on block type and user preference
  const renderAdvancedEditor = useMemo(() => {
    const mode = getEditorMode();
    
    switch (mode) {
      case 'code':
        const codeData = editData as CodeBlockData;
        return (
          <CodeBlockEditor
            key={`code-${block.id}`}
            code={codeData.code || ''}
            language={codeData.language || 'javascript'}
            onChange={(code, language) => setEditData({ ...codeData, code, language })}
            className="w-full"
          />
        );
      
      default:
        // For PARAGRAPH and HEADING blocks, check if user wants markdown mode
        if (block.blockType === 'PARAGRAPH' && editorMode === 'markdown') {
          const paragraphData = editData as ParagraphData;
          return (
            <SplitViewEditor
              key={`markdown-${block.id}`}
              content={paragraphData.text || ''}
              onChange={(content) => setEditData({ ...paragraphData, text: content })}
              placeholder="Start writing in markdown..."
              className="w-full"
            />
          );
        }
        
        if (block.blockType === 'HEADING') {
          const headingData = editData as HeadingData;
          return (
            <RichTextEditor
              key={`heading-${block.id}`}
              content={headingData.text || ''}
              onChange={(data) => {
                // Handle both string (paragraph mode) and HeadingData (heading mode)
                if (typeof data === 'string') {
                  setEditData({ ...headingData, text: data });
                } else {
                  setEditData({ ...headingData, ...data });
                }
              }}
              placeholder="Enter your heading text here..."
              className="w-full"
              mode="heading"
              headingLevel={headingData.level || 2}
              anchor={headingData.anchor || ''}
              isEditing={isEditing}
            />
          );
        }
        
        if (block.blockType === 'PARAGRAPH') {
          const paragraphData = editData as ParagraphData;
          return (
            <RichTextEditor
              key={`paragraph-${block.id}`}
              content={paragraphData.text || ''}
              onChange={(content) => {
                // Handle both string and HeadingData types
                const textContent = typeof content === 'string' ? content : content.text;
                // Only update if content is actually different
                if (textContent !== paragraphData.text) {
                  setEditData({ ...paragraphData, text: textContent });
                }
              }}
              placeholder="Start writing..."
              className="w-full"
            />
          );
        }

        if (block.blockType === 'QUOTE') {
          const quoteData = editData as QuoteData;
          return (
            <QuoteEditor
              key={`quote-${block.id}`}
              data={quoteData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={true}
            />
          );
        }

        if (block.blockType === 'LIST') {
          const listData = editData as ListData;
          return (
            <ListEditor
              key={`list-${block.id}`}
              data={listData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={true}
            />
          );
        }

        if (block.blockType === 'DIVIDER') {
          const dividerData = editData as DividerData;
          return (
            <DividerEditor
              key={`divider-${block.id}`}
              data={dividerData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={true}
            />
          );
        }

        if (block.blockType === 'CUSTOM') {
          const customData = editData as CustomData;
          return (
            <CustomHTMLEditor
              key={`custom-${block.id}`}
              data={customData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={true}
            />
          );
        }

        return null;
    }
  }, [block.blockType, block.id, editData, editorMode]);

  // Render basic form for non-text blocks
  const renderBasicForm = () => {
    switch (block.blockType) {
      case 'IMAGE':
        const imageData = editData as ImageData;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL *</label>
              <input
                type="text"
                value={imageData.src || ''}
                onChange={(e) => setEditData({ ...imageData, src: e.target.value })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base"
                placeholder="Enter image URL..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text *</label>
              <input
                type="text"
                value={imageData.alt || ''}
                onChange={(e) => setEditData({ ...imageData, alt: e.target.value })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base"
                placeholder="Enter alt text for accessibility..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption (Optional)</label>
              <input
                type="text"
                value={imageData.caption || ''}
                onChange={(e) => setEditData({ ...imageData, caption: e.target.value })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base"
                placeholder="Enter image caption..."
              />
            </div>
          </div>
        );

      case 'QUOTE':
        const quoteData = editData as QuoteData;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quote Text *</label>
              <textarea
                value={quoteData.text || ''}
                onChange={(e) => setEditData({ ...quoteData, text: e.target.value })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base leading-relaxed"
                rows={4}
                placeholder="Enter your quote text here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
              <input
                type="text"
                value={quoteData.author || ''}
                onChange={(e) => setEditData({ ...quoteData, author: e.target.value })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base"
                placeholder="Enter author name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source (Optional)</label>
              <input
                type="text"
                value={quoteData.source || ''}
                onChange={(e) => setEditData({ ...quoteData, source: e.target.value })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base"
                placeholder="Enter source or reference..."
              />
            </div>
          </div>
        );

      case 'LIST':
        const listData = editData as ListData;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">List Type</label>
              <select
                value={listData.type || 'unordered'}
                onChange={(e) => setEditData({ ...listData, type: e.target.value as 'unordered' | 'ordered' })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base font-medium"
              >
                <option value="unordered">Bullet List (Unordered)</option>
                <option value="ordered">Numbered List (Ordered)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">List Items</label>
              <div className="space-y-3">
                {(listData.items || []).map((item: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(listData.items || [])];
                        newItems[index] = e.target.value;
                        setEditData({ ...listData, items: newItems });
                      }}
                      className="flex-1 p-3 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base"
                      placeholder={`Enter list item ${index + 1}...`}
                    />
                    <button
                      onClick={() => {
                        const newItems = (listData.items || []).filter((_: string, i: number) => i !== index);
                        setEditData({ ...listData, items: newItems });
                      }}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItems = [...(listData.items || []), ''];
                    setEditData({ ...listData, items: newItems });
                  }}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Item
                </button>
              </div>
            </div>
          </div>
        );

      case 'DIVIDER':
        const dividerData = editData as DividerData;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Divider Style</label>
              <select
                value={dividerData.style || 'solid'}
                onChange={(e) => setEditData({ ...dividerData, style: e.target.value as 'solid' | 'dashed' | 'dotted' | 'double' })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base font-medium"
              >
                <option value="solid">Solid Line</option>
                <option value="dashed">Dashed Line</option>
                <option value="dotted">Dotted Line</option>
                <option value="double">Double Line</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Divider Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={dividerData.color || '#000000'}
                  onChange={(e) => setEditData({ ...dividerData, color: e.target.value })}
                  className="w-16 h-12 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-mono">{dividerData.color || '#000000'}</span>
              </div>
            </div>
          </div>
        );

      case 'CUSTOM':
        const customData = editData as CustomData;
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom HTML Code</label>
              <textarea
                value={customData.html || ''}
                onChange={(e) => setEditData({ ...customData, html: e.target.value })}
                className="w-full p-4 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-600 font-mono resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:bg-white transition-all duration-200 text-base leading-relaxed"
                rows={8}
                placeholder="Enter your custom HTML code here..."
              />
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Security Warning</p>
                  <p>Custom HTML can include scripts and may pose security risks. Only use HTML from trusted sources.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all duration-200">
        {/* Block Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <BlockTypeIcon blockType={block.blockType} />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {block.blockType.replace('_', ' ').toLowerCase()}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              title="Edit block"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete block"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Block Content Preview */}
        <div className="block-content-preview">
          {block.blockType === 'PARAGRAPH' && (
            <div
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: (editData as ParagraphData).text ? sanitizeRichText((editData as ParagraphData).text) : `Empty paragraph...`
              }}
            />
          )}
          
          {block.blockType === 'HEADING' && (
            <div
              className={`font-semibold text-gray-900 ${(editData as HeadingData).level === 1 ? 'text-3xl' : (editData as HeadingData).level === 2 ? 'text-2xl' : (editData as HeadingData).level === 3 ? 'text-xl' : 'text-lg'}`}
              dangerouslySetInnerHTML={{ __html: sanitizeRichText((editData as HeadingData).text || `Empty heading...`) }}
            />
          )}
          
          {block.blockType === 'IMAGE' && (
            <div className="py-4">
              {(editData as ImageData).src ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      (editData as ImageData).alignment === 'left' ? 'flex-start' :
                      (editData as ImageData).alignment === 'right' ? 'flex-end' :
                      (editData as ImageData).alignment === 'full' ? 'stretch' :
                      'center',
                    width: '100%'
                  }}
                >
                  <div style={{ width: (editData as ImageData).alignment === 'full' ? '100%' : `${(editData as ImageData).width || 100}%` }}>
                    <img
                      src={(editData as ImageData).src}
                      alt={(editData as ImageData).alt || ''}
                      className="w-full h-auto"
                      style={{
                        borderRadius: `${(editData as ImageData).borderRadius || 0}px`,
                        boxShadow: (editData as ImageData).shadow ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none'
                      }}
                    />
                    {(editData as ImageData).caption && (
                      <p
                        className="text-sm text-gray-600 mt-2 italic"
                        style={{
                          textAlign:
                            (editData as ImageData).alignment === 'left' ? 'left' :
                            (editData as ImageData).alignment === 'right' ? 'right' :
                            'center'
                        }}
                      >
                        {(editData as ImageData).caption}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  📷 No image
                </div>
              )}
            </div>
          )}
          
          {block.blockType === 'CODE_BLOCK' && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">{(editData as CodeBlockData).language || 'javascript'}</span>
                <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
              <pre>{(editData as CodeBlockData).code || `// No code yet...`}</pre>
            </div>
          )}
          
          {block.blockType === 'QUOTE' && (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-700">
               &ldquo;{(editData as QuoteData).text || `Empty quote...`}&rdquo;
               {(editData as QuoteData).author && (
                 <footer className="text-sm text-gray-500 mt-2">— {(editData as QuoteData).author}</footer>
               )}
             </blockquote>
          )}
          
          {block.blockType === 'LIST' && (
            <div className={(editData as ListData).type === 'ordered' ? 'list-decimal' : 'list-disc'}>
               {((editData as ListData).items || []).map((item: string, index: number) => (
                 <li key={index} className="text-gray-700">{item || `Item ${index + 1}...`}</li>
               ))}
             </div>
          )}
          
          {block.blockType === 'DIVIDER' && (
            <hr className={`border-t-2 ${(editData as DividerData).style === 'dashed' ? 'border-dashed' : (editData as DividerData).style === 'dotted' ? 'border-dotted' : (editData as DividerData).style === 'double' ? 'border-double' : 'border-solid'}`} style={{ borderColor: (editData as DividerData).color || '#000000' }} />
          )}
          
          {block.blockType === 'CUSTOM' && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Custom HTML Block</div>
              <div className="bg-white p-2 rounded border text-xs text-gray-500 font-mono overflow-x-auto">
                 {(editData as CustomData).html || `No HTML content...`}
               </div>
             </div>
          )}
        </div>

        {/* Move Controls */}
        <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onMoveUp && !isFirst && (
            <button
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
              title="Move up"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          
          {onMoveDown && !isLast && (
            <button
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
              title="Move down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg p-6 shadow-lg">
      {/* Editor Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <BlockTypeIcon blockType={block.blockType} />
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            Edit {block.blockType.replace('_', ' ').toLowerCase()}
          </h3>
        </div>
        
        {/* Editor Mode Toggle for text blocks */}
        {(block.blockType === 'PARAGRAPH' || block.blockType === 'HEADING') && (
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setEditorMode('rich')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                editorMode === 'rich' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Rich Text
            </button>
            <button
              onClick={() => setEditorMode('markdown')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                editorMode === 'markdown' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4-4-4-4M6 16l-4-4 4-4" />
              </svg>
              Markdown
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="mb-6">
        {(block.blockType === 'PARAGRAPH' || block.blockType === 'HEADING' || block.blockType === 'CODE_BLOCK' ||
          block.blockType === 'QUOTE' || block.blockType === 'LIST' || block.blockType === 'DIVIDER' || block.blockType === 'CUSTOM')
          ? renderAdvancedEditor
          : renderBasicForm()
        }
      </div>

      {/* Editor Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
