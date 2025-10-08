'use client';

import { ChevronDown } from 'lucide-react';

interface HighlightDropdownProps {
  recentColors: string[];
  savedColors: string[];
  onColorClick: (color: string) => void;
  onCustomClick: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function HighlightDropdown({
  recentColors,
  savedColors,
  onColorClick,
  onCustomClick,
  isOpen,
  onToggle
}: HighlightDropdownProps) {
  const hasRecentColors = recentColors.length > 0;
  const hasSavedColors = savedColors.length > 0;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
        title="Highlight Color"
        aria-label="Highlight Color"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/>
        </svg>
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50 p-3">
          {/* Recent Colors */}
          {hasRecentColors && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-600 mb-2">Recent Colors</div>
              <div className="space-y-1">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onColorClick(color)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div
                      className="w-8 h-8 rounded-md border-2 border-gray-200 group-hover:border-blue-500 transition-colors flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-mono text-gray-700">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Colors */}
          {hasSavedColors && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-600 mb-2">Saved Colors</div>
              <div className="grid grid-cols-8 gap-2">
                {savedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onColorClick(color)}
                    className="w-full aspect-square rounded-md border-2 border-gray-200 hover:border-blue-500 transition-all hover:scale-110 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          {(hasRecentColors || hasSavedColors) && (
            <div className="border-t border-gray-200 my-3" />
          )}

          {/* Custom Color Button */}
          <button
            onClick={onCustomClick}
            className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
          >
            + Custom Color
          </button>
        </div>
      )}
    </div>
  );
}
