"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";
import HeadingEditor from "./HeadingEditor";
import SplitViewEditor from "./SplitViewEditor";
import CodeBlockEditor from "./CodeBlockEditor";

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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function EnhancedBlockEditor({
  block,
  onUpdate,
  onDelete,
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
