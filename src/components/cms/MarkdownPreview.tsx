"use client";

import { useState, useEffect } from "react";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced markdown to HTML conversion with syntax highlighting
  const convertMarkdownToHtml = (markdown: string): string => {
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic text-gray-800">$1</em>')
      
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Code blocks with syntax highlighting
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        const language = lang || 'text';
        return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${language}">${code.trim()}</code></pre>`;
      })
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-400 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">$1</blockquote>')
      
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-gray-700">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-700">$2</li>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-gray-300 my-6" />')
      
      // Line breaks
      .replace(/\n\n/gim, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/\n/gim, '<br>');

    // Wrap in paragraph tags
    html = `<p class="text-gray-700 leading-relaxed mb-4">${html}</p>`;
    
    // Clean up empty paragraphs
    html = html.replace(/<p class="text-gray-700 leading-relaxed mb-4"><\/p>/gim, '');
    
    return html;
  };

  if (!mounted) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-medium text-gray-700">Markdown Preview</h3>
      </div>
      <div 
        className="p-4 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(content) }}
      />
    </div>
  );
}
