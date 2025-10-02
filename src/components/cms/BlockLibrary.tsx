'use client';

import { BlockType } from '@prisma/client';

interface BlockLibraryProps {
  onSelectBlock: (blockType: BlockType) => void;
  onClose: () => void;
}

// Helper function to get icon for each block type
const getBlockIcon = (type: BlockType) => {
  switch (type) {
    case 'PARAGRAPH':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    case 'HEADING':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      );
    case 'IMAGE':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'VIDEO_EMBED':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'CODE_BLOCK':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    case 'QUOTE':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    case 'LIST':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    case 'TABLE':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'CALLOUT':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'DIVIDER':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      );
    case 'CUSTOM':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

const blockTypes = [
  {
    type: 'PARAGRAPH' as BlockType,
    name: 'Paragraph',
    description: 'Regular text paragraph',
    color: 'bg-blue-500'
  },
  {
    type: 'HEADING' as BlockType,
    name: 'Heading',
    description: 'Section heading (H1-H6)',
    color: 'bg-green-500'
  },
  {
    type: 'IMAGE' as BlockType,
    name: 'Image',
    description: 'Image with caption',
    color: 'bg-purple-500'
  },
  {
    type: 'CODE_BLOCK' as BlockType,
    name: 'Code Block',
    description: 'Code with syntax highlighting',
    color: 'bg-yellow-500'
  },
  {
    type: 'QUOTE' as BlockType,
    name: 'Quote',
    description: 'Blockquote with attribution',
    color: 'bg-pink-500'
  },
  {
    type: 'LIST' as BlockType,
    name: 'List',
    description: 'Ordered or unordered list',
    color: 'bg-indigo-500'
  },
  {
    type: 'DIVIDER' as BlockType,
    name: 'Divider',
    description: 'Visual separator line',
    color: 'bg-gray-500'
  },
  {
    type: 'CUSTOM' as BlockType,
    name: 'Custom',
    description: 'Custom HTML content',
    color: 'bg-orange-500'
  }
];

export default function BlockLibrary({ onSelectBlock, onClose }: BlockLibraryProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0d0d0d] rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Add Content Block</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Block Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.type}
              onClick={() => onSelectBlock(blockType.type)}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${blockType.color} rounded-lg flex items-center justify-center`}>
                  {getBlockIcon(blockType.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">
                    {blockType.name}
                  </h3>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                {blockType.description}
              </p>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
