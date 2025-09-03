"use client";

import { useState, useEffect } from "react";
import MarkdownPreview from "./MarkdownPreview";

interface SplitViewEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SplitViewEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing in markdown...",
  className = ""
}: SplitViewEditorProps) {
  const [markdownContent, setMarkdownContent] = useState(content);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMarkdownContent(content);
  }, [content]);

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    onChange(value);
  };

  if (!mounted) {
    return (
      <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-t-lg"></div>
          <div className="h-64 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Header with View Controls */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Markdown Editor</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'editor' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'split' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex h-96">
        {/* Editor Panel */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>
            <textarea
              value={markdownContent}
              onChange={(e) => handleMarkdownChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full p-4 resize-none border-0 focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed text-gray-900 placeholder-gray-600"
              style={{ minHeight: '350px' }}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto`}>
            <MarkdownPreview 
              content={markdownContent} 
              className="border-0 rounded-none h-full"
            />
          </div>
        )}
      </div>

      {/* Footer with Help */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>**bold** *italic* `code`</span>
            <span># Heading ## Subheading</span>
            <span>[link](url) ![image](url)</span>
          </div>
          <div className="text-right">
            <span>{markdownContent.length} characters</span>
          </div>
        </div>
      </div>
    </div>
  );
}
