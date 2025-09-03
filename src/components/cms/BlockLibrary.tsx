'use client';

import { BlockType } from '@prisma/client';

interface BlockLibraryProps {
  onSelectBlock: (blockType: BlockType) => void;
  onClose: () => void;
}

const blockTypes = [
  {
    type: 'PARAGRAPH' as BlockType,
    name: 'Paragraph',
    description: 'Regular text paragraph',
    icon: '📝',
    color: 'bg-blue-500'
  },
  {
    type: 'HEADING' as BlockType,
    name: 'Heading',
    description: 'Section heading (H1-H6)',
    icon: '📋',
    color: 'bg-green-500'
  },
  {
    type: 'IMAGE' as BlockType,
    name: 'Image',
    description: 'Image with caption',
    icon: '🖼️',
    color: 'bg-purple-500'
  },
  {
    type: 'CODE_BLOCK' as BlockType,
    name: 'Code Block',
    description: 'Code with syntax highlighting',
    icon: '💻',
    color: 'bg-yellow-500'
  },
  {
    type: 'QUOTE' as BlockType,
    name: 'Quote',
    description: 'Blockquote with attribution',
    icon: '💬',
    color: 'bg-pink-500'
  },
  {
    type: 'LIST' as BlockType,
    name: 'List',
    description: 'Ordered or unordered list',
    icon: '📋',
    color: 'bg-indigo-500'
  },
  {
    type: 'DIVIDER' as BlockType,
    name: 'Divider',
    description: 'Visual separator line',
    icon: '➖',
    color: 'bg-gray-500'
  },
  {
    type: 'CUSTOM' as BlockType,
    name: 'Custom',
    description: 'Custom HTML content',
    icon: '⚙️',
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
                <div className={`w-10 h-10 ${blockType.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {blockType.icon}
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
