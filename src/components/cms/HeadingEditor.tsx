/**
 * @deprecated This component is deprecated and should not be used in new code.
 * Use RichTextEditor with mode="heading" instead for consistent UI/UX across all text blocks.
 *
 * Migration example:
 * ```tsx
 * <RichTextEditor
 *   content={headingData.text}
 *   onChange={(data) => handleChange(data)}
 *   mode="heading"
 *   headingLevel={headingData.level || 2}
 *   anchor={headingData.anchor || ''}
 *   isEditing={isEditing}
 * />
 * ```
 *
 * This file is kept for reference only and will be removed in a future update.
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface HeadingData {
  text: string;
  level: number;
  anchor?: string;
}

interface HeadingEditorProps {
  content: string;
  level: number;
  anchor?: string;
  onChange: (data: HeadingData) => void;
  placeholder?: string;
  className?: string;
  isEditing?: boolean;
}

export default function HeadingEditor({ 
  content, 
  level, 
  anchor = "",
  onChange, 
  placeholder = "Enter your heading text here...",
  className = "",
  isEditing = false
}: HeadingEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(level);
  const [currentAnchor, setCurrentAnchor] = useState(anchor);
  const [showAnchorInput, setShowAnchorInput] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastContentRef = useRef(content);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Initialize editor content only once
  useEffect(() => {
    if (mounted && !isInitialized && editorRef.current) {
      if (content && content.trim() !== '') {
        editorRef.current.innerHTML = content;
        setShowPlaceholder(false);
      } else {
        editorRef.current.innerHTML = '';
        setShowPlaceholder(true);
      }
      setIsInitialized(true);
    }
  }, [mounted, content, isInitialized]);

  // Handle external content updates (only when not typing)
  useEffect(() => {
    if (mounted && isInitialized && !isTyping && content !== lastContentRef.current) {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        lastContentRef.current = content;
        setShowPlaceholder(content.trim() === '');
      }
    }
  }, [mounted, isInitialized, content, isTyping]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      
      // Update placeholder state based on content
      if (newContent.trim() === '') {
        setShowPlaceholder(true);
      } else {
        setShowPlaceholder(false);
      }
      
      setIsTyping(true);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Debounce the onChange call to parent
      timeoutRef.current = setTimeout(() => {
        onChange({
          text: newContent,
          level: currentLevel,
          anchor: currentAnchor
        });
        lastContentRef.current = newContent;
        setIsTyping(false);
      }, 300); // 300ms delay
    }
  };

  const formatText = (command: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        switch (command) {
          case 'bold':
            const boldElement = document.createElement('strong');
            boldElement.style.fontWeight = 'bold';
            try {
              range.surroundContents(boldElement);
            } catch {
              const contents = range.extractContents();
              boldElement.appendChild(contents);
              range.insertNode(boldElement);
            }
            break;

          case 'italic':
            const italicElement = document.createElement('em');
            italicElement.style.fontStyle = 'italic';
            try {
              range.surroundContents(italicElement);
            } catch {
              const contents = range.extractContents();
              italicElement.appendChild(contents);
              range.insertNode(italicElement);
            }
            break;

          case 'underline':
            const underlineElement = document.createElement('span');
            underlineElement.style.textDecoration = 'underline';
            try {
              range.surroundContents(underlineElement);
            } catch {
              const contents = range.extractContents();
              underlineElement.appendChild(contents);
              range.insertNode(underlineElement);
            }
            break;

          case 'justifyLeft':
            const leftDiv = document.createElement('div');
            leftDiv.style.textAlign = 'left';
            try {
              range.surroundContents(leftDiv);
            } catch {
              const contents = range.extractContents();
              leftDiv.appendChild(contents);
              range.insertNode(leftDiv);
            }
            break;

          case 'justifyCenter':
            const centerDiv = document.createElement('div');
            centerDiv.style.textAlign = 'center';
            try {
              range.surroundContents(centerDiv);
            } catch {
              const contents = range.extractContents();
              centerDiv.appendChild(contents);
              range.insertNode(centerDiv);
            }
            break;

          case 'justifyRight':
            const rightDiv = document.createElement('div');
            rightDiv.style.textAlign = 'right';
            try {
              range.surroundContents(rightDiv);
            } catch {
              const contents = range.extractContents();
              rightDiv.appendChild(contents);
              range.insertNode(rightDiv);
            }
            break;
        }

        // Clear selection and focus
        selection.removeAllRanges();
        editorRef.current.focus();
        handleInput();
      }
    }
  };

  const handleLevelChange = (newLevel: number) => {
    setCurrentLevel(newLevel);
    onChange({
      text: editorRef.current?.innerHTML || content,
      level: newLevel,
      anchor: currentAnchor
    });
  };

  const handleAnchorChange = (newAnchor: string) => {
    const cleanAnchor = newAnchor.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setCurrentAnchor(cleanAnchor);
    onChange({
      text: editorRef.current?.innerHTML || content,
      level: currentLevel,
      anchor: cleanAnchor
    });
  };

  const getWordCount = (text: string): number => {
    const plainText = text.replace(/<[^>]*>/g, ' ').trim();
    if (!plainText) return 0;
    return plainText.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string): number => {
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    return plainText.length;
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
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 rounded-t-lg">
        {/* First Row: Level Selector and Formatting */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            {/* Heading Level Selector - Dropdown */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 mr-2">Level:</span>
              <select
                value={currentLevel}
                onChange={(e) => handleLevelChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              >
                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    H{lvl} - {lvl === 1 ? 'Main Title' : lvl === 2 ? 'Section' : lvl === 3 ? 'Subsection' : `Level ${lvl}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-gray-300"></div>

            {/* Text Formatting Group */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 mr-2">Format:</span>
              <button
                onClick={() => formatText('bold')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
                </svg>
                <span className="text-sm font-medium">Bold</span>
              </button>
              <button
                onClick={() => formatText('italic')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Italic"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-sm font-medium">Italic</span>
              </button>
              <button
                onClick={() => formatText('underline')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="text-sm font-medium">Underline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Alignment and Anchor */}
        <div className="flex items-center space-x-6">
          {/* Text Alignment Group */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 mr-2">Align:</span>
            <button
              onClick={() => formatText('justifyLeft')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Align Left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Left</span>
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Align Center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Center</span>
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Align Right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Right</span>
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Anchor/ID Option */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 mr-2">Anchor:</span>
            <button
              onClick={() => setShowAnchorInput(!showAnchorInput)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Add Anchor/ID"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm font-medium">ID</span>
            </button>
          </div>
        </div>

        {/* Anchor Input */}
        {showAnchorInput && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600">Anchor ID:</span>
              <input
                type="text"
                value={currentAnchor}
                onChange={(e) => handleAnchorChange(e.target.value)}
                placeholder="heading-anchor-id"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500 text-sm"
              />
              <button
                onClick={() => setShowAnchorInput(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used for table of contents, deep linking, and navigation. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => {
            setShowPlaceholder(false);
          }}
          onBlur={() => {
            if (editorRef.current && editorRef.current.textContent === '') {
              setShowPlaceholder(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key.length === 1) {
              setShowPlaceholder(false);
            }
          }}
          className={`min-h-32 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 heading-editor ${!showPlaceholder ? 'no-placeholder' : ''}`}
          style={{ 
            minHeight: '120px',
            fontSize: currentLevel === 1 ? '2rem' : currentLevel === 2 ? '1.5rem' : currentLevel === 3 ? '1.25rem' : '1.125rem',
            fontWeight: 'bold'
          }}
          data-placeholder={isEditing ? placeholder : "Click edit button to create your heading"}
        />
        {/* Stats and Status */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-4">
            <span>Words: {getWordCount(content)}</span>
            <span>Characters: {getCharacterCount(content)}</span>
            {currentAnchor && <span className="text-blue-600">ID: #{currentAnchor}</span>}
          </div>
          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
