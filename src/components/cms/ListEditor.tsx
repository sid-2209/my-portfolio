"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

interface ListData {
  type: 'unordered' | 'ordered';
  items: string[];
}

interface ListEditorProps {
  data: ListData;
  onChange: (data: ListData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function ListEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: ListEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<ListData>(data);
  const [isTyping, setIsTyping] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (newData: ListData) => {
    setCurrentData(newData);
    setIsTyping(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the onChange call
    timeoutRef.current = setTimeout(() => {
      onChange(newData);
      setIsTyping(false);
    }, 300);
  };

  const updateListType = (type: 'unordered' | 'ordered') => {
    handleChange({ ...currentData, type });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...currentData.items];
    newItems[index] = value;
    handleChange({ ...currentData, items: newItems });
  };

  const addItem = (index?: number) => {
    const newItems = [...currentData.items];
    const insertIndex = index !== undefined ? index + 1 : newItems.length;
    newItems.splice(insertIndex, 0, '');
    handleChange({ ...currentData, items: newItems });

    // Focus the new item after a short delay
    setTimeout(() => {
      const inputs = document.querySelectorAll('.list-item-input');
      const newInput = inputs[insertIndex] as HTMLInputElement;
      if (newInput) newInput.focus();
    }, 100);
  };

  const removeItem = (index: number) => {
    if (currentData.items.length <= 1) return; // Keep at least one item
    const newItems = currentData.items.filter((_, i) => i !== index);
    handleChange({ ...currentData, items: newItems });
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= currentData.items.length) return;

    const newItems = [...currentData.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    handleChange({ ...currentData, items: newItems });
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addItem(index);
    } else if (e.key === 'Backspace' && currentData.items[index] === '' && currentData.items.length > 1) {
      e.preventDefault();
      removeItem(index);
      // Focus previous item
      setTimeout(() => {
        const inputs = document.querySelectorAll('.list-item-input');
        const prevInput = inputs[Math.max(0, index - 1)] as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }, 100);
    }
  };

  const getListStyleOptions = () => {
    if (currentData.type === 'unordered') {
      return [
        { value: 'disc', label: '• Disc', preview: '•' },
        { value: 'circle', label: '○ Circle', preview: '○' },
        { value: 'square', label: '■ Square', preview: '■' },
        { value: 'none', label: 'None', preview: '' }
      ];
    } else {
      return [
        { value: 'decimal', label: '1. Numbers', preview: '1.' },
        { value: 'lower-alpha', label: 'a. Letters', preview: 'a.' },
        { value: 'upper-alpha', label: 'A. Capital Letters', preview: 'A.' },
        { value: 'lower-roman', label: 'i. Roman', preview: 'i.' },
        { value: 'upper-roman', label: 'I. Capital Roman', preview: 'I.' }
      ];
    }
  };

  if (!mounted) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">List Block</h3>

          {/* List Type Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => updateListType('unordered')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentData.type === 'unordered'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              • Bulleted
            </button>
            <button
              onClick={() => updateListType('ordered')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentData.type === 'ordered'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1. Numbered
            </button>
          </div>
        </div>

        {/* List Style Options */}
        <div className="mt-3 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-600">Style:</label>
          <div className="flex items-center space-x-2">
            {getListStyleOptions().map((style) => (
              <button
                key={style.value}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title={style.label}
              >
                {style.preview} {style.label.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <div className="space-y-3">
          {currentData.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 group"
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) {
                  moveItem(draggedIndex, index);
                  setDraggedIndex(null);
                }
              }}
            >
              {/* Drag Handle */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>

              {/* List Item Number/Bullet */}
              <div className="flex-shrink-0 w-8 text-right">
                {currentData.type === 'ordered' ? (
                  <span className="text-sm font-medium text-gray-600">{index + 1}.</span>
                ) : (
                  <span className="text-lg text-gray-600">•</span>
                )}
              </div>

              {/* Item Input */}
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder={`List item ${index + 1}`}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 list-item-input"
              />

              {/* Item Actions */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                {/* Move Up */}
                <button
                  onClick={() => moveItem(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => moveItem(index, index + 1)}
                  disabled={index === currentData.items.length - 1}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Add Item */}
                <button
                  onClick={() => addItem(index)}
                  className="p-1 text-gray-400 hover:text-green-600"
                  title="Add item below"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {/* Remove Item */}
                {currentData.items.length > 1 && (
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Item Button */}
        <button
          onClick={() => addItem()}
          className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add new item</span>
        </button>

        {/* Live Preview */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Preview
          </label>
          <div className="bg-gray-50 p-4 rounded-lg">
            {currentData.type === 'ordered' ? (
              <ol className="list-decimal list-inside space-y-1">
                {currentData.items.map((item, index) => (
                  <li key={index} className="text-gray-800">
                    {item || `Item ${index + 1}`}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {currentData.items.map((item, index) => (
                  <li key={index} className="text-gray-800">
                    {item || `Item ${index + 1}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Status and Tips */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-500">
            {currentData.items.length} items • Press Enter to add new item • Backspace on empty item to remove
          </div>
          {isTyping && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}