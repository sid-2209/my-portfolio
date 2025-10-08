'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Check } from 'lucide-react';

interface ColorInputModalProps {
  type: 'text' | 'highlight';
  isOpen: boolean;
  onClose: () => void;
  onApply: (color: string, shouldSave: boolean) => void;
  savedColors: string[];
  onRemoveColor: (color: string) => void;
}

// Utility functions for hex validation
const isValidHex = (color: string): boolean => {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
};

const normalizeHex = (hex: string): string => {
  // If 3-digit hex (#RGB), expand to 6-digit (#RRGGBB)
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
};

const formatHexInput = (value: string): string => {
  // Auto-add # prefix if missing
  let formatted = value.trim();
  if (formatted && !formatted.startsWith('#')) {
    formatted = '#' + formatted;
  }
  // Convert to uppercase for consistency
  return formatted.toUpperCase();
};

export default function ColorInputModal({
  type,
  isOpen,
  onClose,
  onApply,
  savedColors,
  onRemoveColor
}: ColorInputModalProps) {
  const [hexInput, setHexInput] = useState('');
  const [shouldSave, setShouldSave] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHexInput('');
      setShouldSave(false);
    }
  }, [isOpen]);

  const handleApply = () => {
    const formatted = formatHexInput(hexInput);
    if (isValidHex(formatted)) {
      onApply(normalizeHex(formatted), shouldSave);
      onClose();
    }
  };

  const handleSavedColorClick = (color: string) => {
    onApply(color, false); // Already saved, no need to save again
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      onClose();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      setShouldSave(true);
      handleApply();
    }
  };

  if (!isOpen) return null;

  const formattedHex = formatHexInput(hexInput);
  const isValid = isValidHex(formattedHex);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'text' ? 'Text Color' : 'Highlight Color'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hex Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Hex Color Code
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="#E34234"
              maxLength={7}
              className={`flex-1 px-4 py-3 text-base text-gray-900 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                hexInput && isValid
                  ? 'border-green-500 bg-green-50'
                  : hexInput
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
            />
            {/* Live Preview Swatch */}
            <div
              className="w-16 h-12 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-inner"
              style={{
                backgroundColor: hexInput && isValid ? normalizeHex(formattedHex) : '#ffffff'
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Examples: #E34234, #fff, #1F2937 • Press Enter to apply • ⌘S to save
          </p>
        </div>

        {/* Save Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={shouldSave}
              onChange={(e) => setShouldSave(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">
              Save this color for future use
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!hexInput || !isValid}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Apply Color
          </button>
        </div>

        {/* Saved Colors Section */}
        {savedColors.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Saved Colors</h4>
              <span className="text-xs text-gray-500">{savedColors.length}/20</span>
            </div>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
              {savedColors.map((color) => (
                <div key={color} className="relative group">
                  <button
                    onClick={() => handleSavedColorClick(color)}
                    className="w-full aspect-square rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all hover:scale-110 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveColor(color);
                    }}
                    className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    title="Remove color"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
