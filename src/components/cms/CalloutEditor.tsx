"use client";

import { useState, useRef, useEffect } from "react";
import { Info, AlertTriangle, XCircle, CheckCircle, Lightbulb } from "lucide-react";

interface CalloutData {
  type: 'info' | 'warning' | 'error' | 'success' | 'tip';
  title?: string;
  content: string;
  dismissible?: boolean;
}

interface CalloutEditorProps {
  data: CalloutData;
  onChange: (data: CalloutData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function CalloutEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: CalloutEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<CalloutData>(data);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [currentData.content]);

  const handleChange = (field: keyof CalloutData, value: string | boolean) => {
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

  const calloutStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5" />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5" />,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="w-5 h-5" />,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5" />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    tip: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      icon: <Lightbulb className="w-5 h-5" />,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  };

  const currentStyle = calloutStyles[currentData.type];

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
        <h3 className="text-lg font-semibold text-gray-900">Callout/Alert Block</h3>
        <p className="text-sm text-gray-600 mt-1">Create attention-grabbing notifications and alerts</p>
      </div>

      {/* Editor Content */}
      <div className="p-4 space-y-4">
        {/* Callout Type Selection */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Callout Type
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(calloutStyles) as Array<keyof typeof calloutStyles>).map((type) => {
              const style = calloutStyles[type];
              return (
                <button
                  key={type}
                  onClick={() => handleChange('type', type)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    currentData.type === type
                      ? `${style.border} ${style.bg}`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`flex flex-col items-center gap-2 ${
                    currentData.type === type ? style.iconColor : 'text-gray-600'
                  }`}>
                    {style.icon}
                    <span className="text-xs font-medium capitalize">{type}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Title (Optional)
          </label>
          <input
            type="text"
            value={currentData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter callout title..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          />
        </div>

        {/* Content Input */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Content *
          </label>
          <textarea
            ref={contentRef}
            value={currentData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Enter your message here..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none min-h-[100px]"
          />
        </div>

        {/* Options */}
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentData.dismissible || false}
              onChange={(e) => handleChange('dismissible', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Make dismissible (show close button)</span>
          </label>
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Preview
          </label>
          <div className={`${currentStyle.bg} ${currentStyle.border} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${currentStyle.iconBg} ${currentStyle.iconColor} p-2 rounded-lg`}>
                {currentStyle.icon}
              </div>
              <div className="flex-1">
                {currentData.title && (
                  <h4 className={`${currentStyle.text} font-semibold mb-1`}>
                    {currentData.title}
                  </h4>
                )}
                <p className={`${currentStyle.text}`}>
                  {currentData.content || 'Enter your message above...'}
                </p>
              </div>
              {currentData.dismissible && (
                <button className={`flex-shrink-0 ${currentStyle.iconColor} hover:opacity-70 transition-opacity`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Characters: {currentData.content.length}
            {currentData.content.length > 500 && (
              <span className="text-amber-600 ml-2">
                Consider keeping callouts concise
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
