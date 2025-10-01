"use client";

import { useState, useRef, useEffect } from "react";

interface QuoteData {
  text: string;
  author?: string;
  source?: string;
}

interface QuoteEditorProps {
  data: QuoteData;
  onChange: (data: QuoteData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function QuoteEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: QuoteEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<QuoteData>(data);
  const [isTyping, setIsTyping] = useState(false);
  const [quoteStyle, setQuoteStyle] = useState<'classic' | 'modern' | 'minimal'>('classic');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [currentData.text]);

  const handleChange = (field: keyof QuoteData, value: string) => {
    const newData = { ...currentData, [field]: value };
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

  const getQuoteStyleClasses = () => {
    switch (quoteStyle) {
      case 'modern':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500';
      case 'minimal':
        return 'bg-gray-50 border-l-2 border-gray-400';
      default: // classic
        return 'bg-yellow-50 border-l-4 border-yellow-500';
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
          <h3 className="text-lg font-semibold text-gray-900">Quote Block</h3>

          {/* Quote Style Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">Style:</label>
            <select
              value={quoteStyle}
              onChange={(e) => setQuoteStyle(e.target.value as 'classic' | 'modern' | 'minimal')}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>

        {/* Style Preview */}
        <div className="mt-3">
          <div className={`p-3 rounded-lg ${getQuoteStyleClasses()}`}>
            <p className="text-sm text-gray-600 italic">
              &ldquo;This is how your quote will appear&rdquo;
            </p>
            <cite className="text-xs text-gray-500 mt-1 block">— Preview Author</cite>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4 space-y-4">
        {/* Quote Text */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Quote Text *
          </label>
          <textarea
            ref={textareaRef}
            value={currentData.text}
            onChange={(e) => handleChange('text', e.target.value)}
            placeholder="Enter your quote text here..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none min-h-[120px]"
            style={{ fontSize: '1.1rem', lineHeight: '1.6' }}
          />
          <p className="text-xs text-gray-500 mt-1">
            The main quote content. Use quotation marks if desired.
          </p>
        </div>

        {/* Author and Source */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Author (Optional)
            </label>
            <input
              type="text"
              value={currentData.author || ''}
              onChange={(e) => handleChange('author', e.target.value)}
              placeholder="Author name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Source (Optional)
            </label>
            <input
              type="text"
              value={currentData.source || ''}
              onChange={(e) => handleChange('source', e.target.value)}
              placeholder="Book, article, speech, etc."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Preview
          </label>
          <div className={`p-4 rounded-lg ${getQuoteStyleClasses()}`}>
            <blockquote className="text-lg italic text-gray-800 leading-relaxed">
              &ldquo;{currentData.text || 'Enter your quote text above...'}&rdquo;
            </blockquote>
            {(currentData.author || currentData.source) && (
              <cite className="text-sm text-gray-600 mt-3 block">
                — {currentData.author || 'Unknown'}
                {currentData.source && (
                  <span className="text-gray-500 ml-2">
                    ({currentData.source})
                  </span>
                )}
              </cite>
            )}
          </div>
        </div>

        {/* Character Count and Status */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Characters: {currentData.text.length}
            {currentData.text.length > 500 && (
              <span className="text-amber-600 ml-2">
                Consider keeping quotes concise for better impact
              </span>
            )}
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