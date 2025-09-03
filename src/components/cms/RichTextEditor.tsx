"use client";

import { useState, useRef, useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = ""
}: RichTextEditorProps) {
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(content);
  const editorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMarkdownMode) {
      setMarkdownContent(content);
    }
  }, [content, isMarkdownMode]);

  const handleInput = () => {
    if (editorRef.current && !isMarkdownMode) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    onChange(value);
  };

  const toggleMarkdown = () => {
    if (isMarkdownMode) {
      // Convert markdown to HTML (basic conversion)
      const htmlContent = convertMarkdownToHtml(markdownContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
      }
      onChange(htmlContent);
    } else {
      // Convert HTML to markdown (basic conversion)
      const markdown = convertHtmlToMarkdown(content);
      setMarkdownContent(markdown);
    }
    setIsMarkdownMode(!isMarkdownMode);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  const insertCodeBlock = () => {
    const code = prompt('Enter code:');
    if (code) {
      const codeBlock = `<pre><code>${code}</code></pre>`;
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createRange().createContextualFragment(codeBlock));
        }
        handleInput();
      }
    }
  };

  const insertQuote = () => {
    const quote = prompt('Enter quote text:');
    if (quote) {
      const quoteBlock = `<blockquote>${quote}</blockquote>`;
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createRange().createContextualFragment(quoteBlock));
        }
        handleInput();
      }
    }
  };

  // Basic markdown to HTML conversion
  const convertMarkdownToHtml = (markdown: string): string => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*)`/gim, '<code>$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
      .replace(/\n/g, '<br>');
  };

  // Basic HTML to markdown conversion
  const convertHtmlToMarkdown = (html: string): string => {
    return html
      .replace(/<h1>(.*?)<\/h1>/gim, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gim, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gim, '### $1\n')
      .replace(/<strong>(.*?)<\/strong>/gim, '**$1**')
      .replace(/<em>(.*?)<\/em>/gim, '*$1*')
      .replace(/<code>(.*?)<\/code>/gim, '`$1`')
      .replace(/<blockquote>(.*?)<\/blockquote>/gim, '> $1\n')
      .replace(/<li>(.*?)<\/li>/gim, '- $1\n')
      .replace(/<br\s*\/?>/gim, '\n')
      .replace(/<[^>]*>/g, '');
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
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Text Formatting */}
            <button
              onClick={() => formatText('bold')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Bold"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 011-1h5.5a3.5 3.5 0 013.5 3.5v1a3.5 3.5 0 01-3.5 3.5H6a1 1 0 00-1 1v2a1 1 0 001 1h4.5a3.5 3.5 0 013.5 3.5v1a3.5 3.5 0 01-3.5 3.5H6a1 1 0 01-1-1V4z"/>
              </svg>
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Italic"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 000 2h1.5l-3 8H6a1 1 0 100 2h4a1 1 0 100-2h-1.5l3-8H12a1 1 0 100-2H8z"/>
              </svg>
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Underline"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Headings */}
            <select
              onChange={(e) => {
                if (e.target.value === 'p') {
                  formatText('formatBlock', 'p');
                } else {
                  formatText('formatBlock', e.target.value);
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
            </select>
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Lists */}
            <button
              onClick={() => formatText('insertUnorderedList')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Bullet List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Numbered List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            {/* Special Elements */}
            <button
              onClick={insertLink}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Link"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
              </svg>
            </button>
            <button
              onClick={insertCodeBlock}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Code Block"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
            <button
              onClick={insertQuote}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Quote"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
          </div>
          
          {/* Markdown Toggle */}
          <button
            onClick={toggleMarkdown}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              isMarkdownMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isMarkdownMode ? 'Rich Text' : 'Markdown'}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        {isMarkdownMode ? (
          <textarea
            value={markdownContent}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-64 p-3 border border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: content }}
            className="min-h-64 p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            style={{ minHeight: '200px' }}
            data-placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
}
