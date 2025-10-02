"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";
import HeadingEditor from "./HeadingEditor";
import SplitViewEditor from "./SplitViewEditor";
import CodeBlockEditor from "./CodeBlockEditor";
import QuoteEditor from "./QuoteEditor";
import ListEditor from "./ListEditor";
import DividerEditor from "./DividerEditor";
import CustomHTMLEditor from "./CustomHTMLEditor";
import VideoEmbedEditor from "./VideoEmbedEditor";
import CalloutEditor from "./CalloutEditor";
import TableEditor from "./TableEditor";
import ImagePicker from "../media/ImagePicker";

// Import the same interfaces used in BlockEditor for consistency
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
  width?: number; // percentage
  borderRadius?: number;
  shadow?: boolean;
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

interface VideoEmbedData {
  url: string;
  type?: 'youtube' | 'vimeo' | 'loom' | 'twitter' | 'other';
  autoplay?: boolean;
  controls?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
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

// Union type for all possible block data
type BlockData =
  | ParagraphData
  | HeadingData
  | ImageData
  | VideoEmbedData
  | CodeBlockData
  | QuoteData
  | ListData
  | DividerData
  | TableData
  | CalloutData
  | CustomData;

interface Block {
  id: string;
  contentId: string;
  blockType: string;
  order: number;
  data: BlockData;
  createdAt: Date;
  updatedAt: Date;
}

interface EnhancedBlockEditorProps {
  block: Block;
  onUpdate: (data: BlockData) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function EnhancedBlockEditor({
  block,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: EnhancedBlockEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<BlockData>(block.data);
  const [editorMode, setEditorMode] = useState<'rich' | 'markdown' | 'code'>('rich');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditData(block.data);
  }, [block.data]);

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(block.data);
    setIsEditing(false);
  };

  // Format and insert handlers are handled by the individual editors

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

  const renderEditor = () => {
    const mode = getEditorMode();
    
    switch (mode) {
      case 'code':
        const codeData = editData as CodeBlockData;
        return (
          <CodeBlockEditor
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
            <HeadingEditor
              content={headingData.text || ''}
              level={headingData.level || 2}
              anchor={headingData.anchor || ''}
              onChange={(data) => setEditData({ ...headingData, ...data })}
              placeholder="Enter your heading text here..."
              className="w-full"
              isEditing={isEditing}
            />
          );
        }
        
        if (block.blockType === 'PARAGRAPH') {
          const paragraphData = editData as ParagraphData;
          return (
            <RichTextEditor
              content={paragraphData.text || ''}
              onChange={(content) => setEditData({ ...paragraphData, text: content })}
              placeholder="Start typing your paragraph here..."
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

        if (block.blockType === 'IMAGE') {
          const imageData = editData as ImageData;
          return (
            <div className="space-y-4">
              <ImagePicker
                label="Image"
                value={imageData.src || ''}
                onChange={(media) => setEditData({
                  ...imageData,
                  src: media?.blobUrl || ''
                })}
                onUrlChange={(url) => setEditData({
                  ...imageData,
                  src: url
                })}
                source="content-block"
                contentId={block.contentId}
                blockId={block.id}
                folder="blocks"
                placeholder="No image selected"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={imageData.alt || ''}
                    onChange={(e) => setEditData({
                      ...imageData,
                      alt: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Describe this image"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={imageData.caption || ''}
                    onChange={(e) => setEditData({
                      ...imageData,
                      caption: e.target.value
                    })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Optional caption"
                  />
                </div>
              </div>

              {/* Alignment Options */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Alignment
                </label>
                <div className="flex gap-2">
                  {(['left', 'center', 'right', 'full'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => setEditData({
                        ...imageData,
                        alignment: align
                      })}
                      className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                        (imageData.alignment || 'center') === align
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
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
                  Width: {imageData.width || 100}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={imageData.width || 100}
                  onChange={(e) => setEditData({
                    ...imageData,
                    width: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
              </div>

              {/* Styling Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Border Radius: {imageData.borderRadius || 0}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={imageData.borderRadius || 0}
                    onChange={(e) => setEditData({
                      ...imageData,
                      borderRadius: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imageData.shadow || false}
                      onChange={(e) => setEditData({
                        ...imageData,
                        shadow: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add Shadow</span>
                  </label>
                </div>
              </div>
            </div>
          );
        }

        if (block.blockType === 'VIDEO_EMBED') {
          const videoData = editData as VideoEmbedData;
          return (
            <VideoEmbedEditor
              data={videoData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

        if (block.blockType === 'CALLOUT') {
          const calloutData = editData as CalloutData;
          return (
            <CalloutEditor
              data={calloutData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

        if (block.blockType === 'TABLE') {
          const tableData = editData as TableData;
          return (
            <TableEditor
              data={tableData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

        if (block.blockType === 'QUOTE') {
          const quoteData = editData as QuoteData;
          return (
            <QuoteEditor
              data={quoteData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

        if (block.blockType === 'LIST') {
          const listData = editData as ListData;
          return (
            <ListEditor
              data={listData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

        if (block.blockType === 'DIVIDER') {
          const dividerData = editData as DividerData;
          return (
            <DividerEditor
              data={dividerData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

        if (block.blockType === 'CUSTOM') {
          const customData = editData as CustomData;
          return (
            <CustomHTMLEditor
              data={customData}
              onChange={(data) => setEditData(data)}
              className="w-full"
              isEditing={isEditing}
            />
          );
        }

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

            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                title="Duplicate block"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            )}

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
              dangerouslySetInnerHTML={{ __html: (editData as ParagraphData).text || `Empty paragraph...` }}
            />
          )}
          
          {block.blockType === 'HEADING' && (
            <div className={`font-semibold text-gray-900 ${(editData as HeadingData).level === 1 ? 'text-3xl' : (editData as HeadingData).level === 2 ? 'text-2xl' : (editData as HeadingData).level === 3 ? 'text-xl' : 'text-lg'}`}>
               {(editData as HeadingData).text || `Empty heading...`}
             </div>
          )}
          
          {block.blockType === 'CODE_BLOCK' && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">{(editData as CodeBlockData).language || 'javascript'}</span>
                <button className="text-gray-400 hover:text-white transition-colors">
                  📋 Copy
                </button>
              </div>
              <pre>{(editData as CodeBlockData).code || `// No code yet...`}</pre>
            </div>
          )}

          {block.blockType === 'IMAGE' && (
            <div className="space-y-3">
              {(editData as ImageData).src ? (
                <div
                  className="relative group"
                  style={{
                    display: 'flex',
                    justifyContent:
                      (editData as ImageData).alignment === 'left' ? 'flex-start' :
                      (editData as ImageData).alignment === 'right' ? 'flex-end' :
                      (editData as ImageData).alignment === 'full' ? 'stretch' :
                      'center'
                  }}
                >
                  <div style={{ width: (editData as ImageData).alignment === 'full' ? '100%' : `${(editData as ImageData).width || 100}%` }}>
                    <img
                      src={(editData as ImageData).src}
                      alt={(editData as ImageData).alt || 'Block image'}
                      className="w-full"
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
                <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No image selected</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {block.blockType === 'QUOTE' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <blockquote className="text-lg italic text-gray-800 leading-relaxed">
                &ldquo;{(editData as QuoteData).text || 'Enter your quote text...'}&rdquo;
              </blockquote>
              {((editData as QuoteData).author || (editData as QuoteData).source) && (
                <cite className="text-sm text-gray-600 mt-3 block">
                  — {(editData as QuoteData).author || 'Unknown'}
                  {(editData as QuoteData).source && (
                    <span className="text-gray-500 ml-2">
                      ({(editData as QuoteData).source})
                    </span>
                  )}
                </cite>
              )}
            </div>
          )}

          {block.blockType === 'LIST' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {(editData as ListData).type === 'ordered' ? (
                <ol className="list-decimal list-inside space-y-1">
                  {(editData as ListData).items.map((item, index) => (
                    <li key={index} className="text-gray-800">
                      {item || `Item ${index + 1}`}
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {(editData as ListData).items.map((item, index) => (
                    <li key={index} className="text-gray-800">
                      {item || `Item ${index + 1}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {block.blockType === 'DIVIDER' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Content above divider</div>
              <div
                style={{
                  marginTop: `${(editData as DividerData).marginTop || 20}px`,
                  marginBottom: `${(editData as DividerData).marginBottom || 20}px`,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <hr
                  style={{
                    border: 'none',
                    borderTop: `${(editData as DividerData).thickness || 1}px ${(editData as DividerData).style} ${(editData as DividerData).color}`,
                    width: `${(editData as DividerData).width || 100}%`,
                    margin: 0
                  }}
                />
              </div>
              <div className="text-sm text-gray-600 mt-2">Content below divider</div>
            </div>
          )}

          {block.blockType === 'VIDEO_EMBED' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {(editData as VideoEmbedData).url ? (
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">
                      {(editData as VideoEmbedData).type ? (
                        <span className="capitalize">{(editData as VideoEmbedData).type} Video</span>
                      ) : (
                        'Video Embed'
                      )}
                    </span>
                    <span className="text-gray-500">
                      {(editData as VideoEmbedData).aspectRatio || '16:9'}
                    </span>
                  </div>
                  <div className="bg-black/5 p-3 rounded text-xs text-gray-600 font-mono break-all">
                    {(editData as VideoEmbedData).url}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {(editData as VideoEmbedData).autoplay && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Autoplay
                      </span>
                    )}
                    {(editData as VideoEmbedData).controls !== false && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Controls
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm">No video URL provided</p>
              )}
            </div>
          )}

          {block.blockType === 'CALLOUT' && (
            (() => {
              const calloutData = editData as CalloutData;
              const calloutStyles = {
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
                error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
                success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
                tip: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' }
              };
              const currentStyle = calloutStyles[calloutData.type || 'info'];

              return (
                <div className={`${currentStyle.bg} ${currentStyle.border} border rounded-lg p-4`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 ${currentStyle.iconBg} ${currentStyle.iconColor} p-2 rounded-lg`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      {calloutData.title && (
                        <h4 className={`${currentStyle.text} font-semibold mb-1`}>
                          {calloutData.title}
                        </h4>
                      )}
                      <p className={`${currentStyle.text} text-sm`}>
                        {calloutData.content || 'No content'}
                      </p>
                    </div>
                    {calloutData.dismissible && (
                      <button className={`flex-shrink-0 ${currentStyle.iconColor} hover:opacity-70 transition-opacity`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          )}

          {block.blockType === 'TABLE' && (
            <div className="overflow-x-auto">
              <table className={`w-full ${(editData as TableData).bordered !== false ? 'border border-gray-300' : ''}`}>
                {(editData as TableData).hasHeader !== false && (
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      {(editData as TableData).headers.map((header, index) => (
                        <th
                          key={index}
                          className={`px-3 py-2 font-semibold text-gray-900 ${
                            (editData as TableData).bordered !== false ? 'border-r border-gray-300 last:border-r-0' : ''
                          } ${
                            {
                              left: 'text-left',
                              center: 'text-center',
                              right: 'text-right'
                            }[(editData as TableData).alignment || 'left']
                          }`}
                        >
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {(editData as TableData).rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`${
                        (editData as TableData).striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''
                      } ${
                        (editData as TableData).bordered !== false ? 'border-b border-gray-300 last:border-b-0' : ''
                      }`}
                    >
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-3 py-2 text-gray-800 ${
                            (editData as TableData).bordered !== false ? 'border-r border-gray-300 last:border-r-0' : ''
                          } ${
                            {
                              left: 'text-left',
                              center: 'text-center',
                              right: 'text-right'
                            }[(editData as TableData).alignment || 'left']
                          }`}
                        >
                          {cell || 'Empty'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {block.blockType === 'CUSTOM' && (
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              {(editData as CustomData).html ? (
                <div
                  dangerouslySetInnerHTML={{ __html: (editData as CustomData).html }}
                />
              ) : (
                <p className="text-gray-500 italic">No HTML content to preview</p>
              )}
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
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            Edit {block.blockType.replace('_', ' ').toLowerCase()}
          </h3>
        </div>
        
        {/* Editor Mode Toggle for text blocks */}
        {(block.blockType === 'PARAGRAPH' || block.blockType === 'HEADING') && (
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setEditorMode('rich')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                editorMode === 'rich' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rich Text
            </button>
            <button
              onClick={() => setEditorMode('markdown')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                editorMode === 'markdown' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Markdown
            </button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="mb-6">
        {renderEditor()}
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
