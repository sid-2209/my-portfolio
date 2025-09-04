"use client";

import { useState, useEffect } from "react";
import EnhancedBlockEditor from "./EnhancedBlockEditor";
import { BlockType } from "@prisma/client";

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
  blockType: BlockType;
  order: number;
  data: BlockData;
  createdAt: Date;
  updatedAt: Date;
}

interface BlockBuilderProps {
  contentId: string;
  initialBlocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

const blockTypes = [
  { type: 'PARAGRAPH' as BlockType, label: 'Paragraph', description: 'Add a text paragraph' },
  { type: 'HEADING' as BlockType, label: 'Heading', description: 'Add a heading (H1-H6)' },
  { type: 'IMAGE' as BlockType, label: 'Image', description: 'Add an image with caption' },
  { type: 'CODE_BLOCK' as BlockType, label: 'Code Block', description: 'Add formatted code' },
  { type: 'QUOTE' as BlockType, label: 'Quote', description: 'Add a blockquote' },
  { type: 'LIST' as BlockType, label: 'List', description: 'Add a bulleted or numbered list' },
  { type: 'DIVIDER' as BlockType, label: 'Divider', description: 'Add a visual separator' },
  { type: 'CUSTOM' as BlockType, label: 'Custom HTML', description: 'Add custom HTML content' }
];

export default function BlockBuilder({ contentId, initialBlocks, onBlocksChange }: BlockBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const addBlock = (blockType: BlockType) => {
    const newBlock: Block = {
      id: `temp-${Date.now()}`,
      contentId,
      blockType,
      order: blocks.length,
      data: getDefaultData(blockType),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onBlocksChange(newBlocks);
    setIsAddingBlock(false);
  };

  const updateBlock = (blockId: string, updatedData: BlockData) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, data: updatedData, updatedAt: new Date() } : block
    );
    setBlocks(updatedBlocks);
    onBlocksChange(updatedBlocks);
  };

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    // Reorder remaining blocks
    const reorderedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    setBlocks(reorderedBlocks);
    onBlocksChange(reorderedBlocks);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap blocks
    [newBlocks[currentIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[currentIndex]];
    
    // Update order
    newBlocks.forEach((block, index) => {
      block.order = index;
    });

    setBlocks(newBlocks);
    onBlocksChange(newBlocks);
  };

  const getDefaultData = (blockType: BlockType): BlockData => {
    switch (blockType) {
      case 'PARAGRAPH':
        return { text: 'Start typing your paragraph here...' };
      case 'HEADING':
        return { text: 'Enter your heading text here...', level: 2 };
      case 'IMAGE':
        return { src: '', alt: 'Enter image description', caption: 'Enter image caption' };
      case 'CODE_BLOCK':
        return { code: '// Enter your code here...', language: 'javascript' };
      case 'QUOTE':
        return { text: 'Enter your quote text here...', author: 'Author Name', source: 'Source (optional)' };
      case 'LIST':
        return { type: 'unordered', items: ['List item 1', 'List item 2', 'List item 3'] };
      case 'DIVIDER':
        return { style: 'solid', color: '#000000' };
      case 'CUSTOM':
        return { html: '<!-- Enter your custom HTML here -->' };
      default:
        return { text: '' };
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-900">Content Blocks</h3>
          <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div className="text-center py-16 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Content Blocks</h3>
        <button
          onClick={() => setIsAddingBlock(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Block
        </button>
      </div>

      {/* Add Block Modal */}
      {isAddingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Block</h3>
              <button
                onClick={() => setIsAddingBlock(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blockTypes.map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="p-6 text-left border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {blockType.label}
                      </h4>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700">
                        {blockType.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blocks List */}
      <div className="space-y-6">
        {blocks.length === 0 ? (
          <div className="text-center py-16 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-xl mb-2 font-medium">No content blocks yet</p>
            <p className="text-gray-500">Click &ldquo;Add Block&rdquo; to start building your content</p>
          </div>
        ) : (
          blocks.map((block, index) => (
                        <div key={block.id} className="relative">
              {/* Block Number Badge */}
              <div className="absolute -top-3 -left-3 z-10">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm">
                  {index + 1}
                </div>
              </div>

              {/* Block Content */}
              <EnhancedBlockEditor
                block={{
                  ...block,
                  data: block.data as unknown as BlockData
                }}
                onUpdate={(data) => updateBlock(block.id, data)}
                onDelete={() => deleteBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                isFirst={index === 0}
                isLast={index === blocks.length - 1}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
