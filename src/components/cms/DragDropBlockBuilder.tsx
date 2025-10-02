"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  alignment?: 'left' | 'center' | 'right' | 'full';
  width?: number;
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
  | CodeBlockData
  | QuoteData
  | ListData
  | DividerData
  | CustomData
  | VideoEmbedData
  | CalloutData
  | TableData;

interface Block {
  id: string;
  contentId: string;
  blockType: BlockType;
  order: number;
  data: BlockData;
  createdAt: Date;
  updatedAt: Date;
}

interface DragDropBlockBuilderProps {
  contentId: string;
  initialBlocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
}

// Sortable Block Item Component
interface SortableBlockItemProps {
  block: Block;
  index: number;
  onUpdate: (data: BlockData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isDragging?: boolean;
}

function SortableBlockItem({ block, index, onUpdate, onDelete, onDuplicate, isDragging }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-12 top-4 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Drag to reorder"
      >
        <div className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300 shadow-sm">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

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
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        // Disable move buttons since we're using drag-and-drop
        onMoveUp={undefined}
        onMoveDown={undefined}
        isFirst={false}
        isLast={false}
      />
    </div>
  );
}

// Helper function to get icon for each block type
const getBlockIcon = (type: BlockType) => {
  switch (type) {
    case 'PARAGRAPH':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    case 'HEADING':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      );
    case 'IMAGE':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'VIDEO_EMBED':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'CODE_BLOCK':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'QUOTE':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'LIST':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    case 'TABLE':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'CALLOUT':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'DIVIDER':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    case 'CUSTOM':
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

const blockTypes = [
  { type: 'PARAGRAPH' as BlockType, label: 'Paragraph', description: 'Add a text paragraph' },
  { type: 'HEADING' as BlockType, label: 'Heading', description: 'Add a heading (H1-H6)' },
  { type: 'IMAGE' as BlockType, label: 'Image', description: 'Add an image with caption' },
  { type: 'VIDEO_EMBED' as BlockType, label: 'Video/Embed', description: 'Embed YouTube, Vimeo, Loom videos' },
  { type: 'CODE_BLOCK' as BlockType, label: 'Code Block', description: 'Add formatted code' },
  { type: 'QUOTE' as BlockType, label: 'Quote', description: 'Add a blockquote' },
  { type: 'LIST' as BlockType, label: 'List', description: 'Add a bulleted or numbered list' },
  { type: 'TABLE' as BlockType, label: 'Table', description: 'Create data tables with styling' },
  { type: 'CALLOUT' as BlockType, label: 'Callout/Alert', description: 'Add info, warning, or success alert' },
  { type: 'DIVIDER' as BlockType, label: 'Divider', description: 'Add a visual separator' },
  { type: 'CUSTOM' as BlockType, label: 'Custom HTML', description: 'Add custom HTML content' }
];

export default function DragDropBlockBuilder({ contentId, initialBlocks, onBlocksChange }: DragDropBlockBuilderProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const duplicateBlock = (blockId: string) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const blockToDuplicate = blocks[blockIndex];
    const newBlock: Block = {
      ...blockToDuplicate,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      order: blockIndex + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newBlocks = [
      ...blocks.slice(0, blockIndex + 1),
      newBlock,
      ...blocks.slice(blockIndex + 1)
    ].map((block, index) => ({
      ...block,
      order: index
    }));

    setBlocks(newBlocks);
    onBlocksChange(newBlocks);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const draggedBlock = blocks.find(block => block.id === active.id);
    setDraggedBlock(draggedBlock || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over?.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);

      // Update order property
      const reorderedBlocks = newBlocks.map((block, index) => ({
        ...block,
        order: index
      }));

      setBlocks(reorderedBlocks);
      onBlocksChange(reorderedBlocks);
    }

    setActiveId(null);
    setDraggedBlock(null);
  };

  const getDefaultData = (blockType: BlockType): BlockData => {
    switch (blockType) {
      case 'PARAGRAPH':
        return { text: '' };
      case 'HEADING':
        return { text: '', level: 2 };
      case 'IMAGE':
        return { src: '', alt: 'Enter image description', caption: 'Enter image caption', alignment: 'center', width: 100, borderRadius: 0, shadow: false };
      case 'VIDEO_EMBED':
        return { url: '', type: 'youtube', autoplay: false, controls: true, aspectRatio: '16:9' };
      case 'CODE_BLOCK':
        return { code: '// Enter your code here...', language: 'javascript' };
      case 'QUOTE':
        return { text: 'Enter your quote text here...', author: 'Author Name', source: 'Source (optional)' };
      case 'LIST':
        return { type: 'unordered', items: ['List item 1', 'List item 2', 'List item 3'] };
      case 'TABLE':
        return {
          headers: ['Column 1', 'Column 2', 'Column 3'],
          rows: [['Data 1', 'Data 2', 'Data 3'], ['Data 4', 'Data 5', 'Data 6']],
          hasHeader: true,
          striped: true,
          bordered: true,
          alignment: 'left'
        };
      case 'CALLOUT':
        return { type: 'info', title: '', content: 'Enter your message here...', dismissible: false };
      case 'DIVIDER':
        return { style: 'solid', color: '#e5e7eb', thickness: 1, width: 100, marginTop: 20, marginBottom: 20 };
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
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900">Content Blocks</h3>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Drag & Drop Enabled
          </div>
        </div>
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
                      {getBlockIcon(blockType.type)}
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

      {/* Blocks List with Drag and Drop */}
      <div className="ml-12"> {/* Add left margin for drag handles */}
        {blocks.length === 0 ? (
          <div className="text-center py-16 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-xl mb-2 font-medium">No content blocks yet</p>
            <p className="text-gray-500">Click &quot;Add Block&quot; to start building your content</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-6">
                {blocks.map((block, index) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    index={index}
                    onUpdate={(data) => updateBlock(block.id, data)}
                    onDelete={() => deleteBlock(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    isDragging={block.id === activeId}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId && draggedBlock ? (
                <div className="opacity-90 transform rotate-2 shadow-2xl">
                  <SortableBlockItem
                    block={draggedBlock}
                    index={blocks.findIndex(b => b.id === activeId)}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onDuplicate={() => {}}
                    isDragging={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Instructions */}
      {blocks.length > 0 && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Drag & Drop Instructions</p>
              <p>Hover over any block and use the drag handle (≡) on the left to reorder blocks. You can also use your keyboard to navigate and reorder blocks.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}