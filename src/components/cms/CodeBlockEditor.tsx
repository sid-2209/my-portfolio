"use client";

import { useState, useEffect } from "react";

interface CodeBlockEditorProps {
  code: string;
  language: string;
  onChange: (code: string, language: string) => void;
  className?: string;
}

const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'text', label: 'Plain Text' }
];

export default function CodeBlockEditor({
  code,
  language,
  onChange,
  className = ""
}: CodeBlockEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Basic syntax highlighting for common languages
  const highlightCode = (code: string, lang: string): string => {
    if (lang === 'text' || !code) return code;

    let highlighted = code;

    switch (lang) {
      case 'javascript':
      case 'typescript':
        highlighted = highlighted
          .replace(/\b(const|let|var|function|class|interface|type|enum|import|export|from|if|else|for|while|return|new|this|async|await|try|catch|finally)\b/g, '<span class="text-blue-600 font-semibold">$1</span>')
          .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-purple-600">$1</span>')
          .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600">$1$2$1</span>')
          .replace(/\/\/.*$/gm, '<span class="text-gray-500 italic">$&</span>')
          .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500 italic">$&</span>');
        break;

      case 'python':
        highlighted = highlighted
          .replace(/\b(def|class|import|from|if|elif|else|for|while|return|try|except|finally|with|as|lambda|yield|async|await)\b/g, '<span class="text-blue-600 font-semibold">$1</span>')
          .replace(/\b(True|False|None)\b/g, '<span class="text-purple-600">$1</span>')
          .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600">$1$2$1</span>')
          .replace(/#.*$/gm, '<span class="text-gray-500 italic">$&</span>');
        break;

      case 'html':
        highlighted = highlighted
          .replace(/&lt;(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^&gt;]*?)&gt;/g, '<span class="text-blue-600">&lt;$1$2</span><span class="text-gray-700">$3</span><span class="text-blue-600">&gt;</span>')
          .replace(/(\w+)=([&quot;'])([^&quot;']*?)\2/g, '<span class="text-red-600">$1</span>=<span class="text-green-600">$2$3$2</span>');
        break;

      case 'css':
        highlighted = highlighted
          .replace(/([.#]?[a-zA-Z][a-zA-Z0-9]*)\s*\{/g, '<span class="text-blue-600">$1</span> {')
          .replace(/([a-zA-Z-]+)\s*:/g, '<span class="text-red-600">$1</span>:')
          .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600">$1$2$1</span>')
          .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500 italic">$&</span>');
        break;

      case 'json':
        highlighted = highlighted
          .replace(/(["'])([^"']*?)\1\s*:/g, '<span class="text-red-600">$1$2$1</span>:')
          .replace(/(["'])([^"']*?)\1/g, '<span class="text-green-600">$1$2$1</span>')
          .replace(/\b(true|false|null)\b/g, '<span class="text-purple-600">$1</span>');
        break;

      case 'sql':
        highlighted = highlighted
          .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|UNION|DISTINCT|COUNT|SUM|AVG|MIN|MAX)\b/gi, '<span class="text-blue-600 font-semibold">$1</span>')
          .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600">$1$2$1</span>');
        break;

      default:
        // Basic highlighting for other languages
        highlighted = highlighted
          .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-600">$1$2$1</span>')
          .replace(/\/\/.*$/gm, '<span class="text-gray-500 italic">$&</span>')
          .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500 italic">$&</span>')
          .replace(/#.*$/gm, '<span class="text-gray-500 italic">$&</span>');
    }

    return highlighted;
  };

  const getLineNumbers = (code: string): string => {
    const lines = code.split('\n');
    return lines.map((_, index) => `<span class="text-gray-400 select-none">${index + 1}</span>`).join('\n');
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
      {/* Header */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => onChange(code, e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {code.split('\n').length} lines
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              Line Numbers
            </label>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Size:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value, language)}
          className="w-full h-64 p-4 font-mono text-sm border-0 resize-none focus:ring-0 focus:outline-none"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: '1.5',
            tabSize: 2
          }}
          placeholder="Enter your code here..."
          spellCheck={false}
        />
        
        {/* Syntax Highlighted Preview */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: '1.5'
          }}
        >
          <div className="flex h-full">
            {showLineNumbers && (
              <div className="flex-shrink-0 px-4 py-4 text-gray-400 select-none font-mono text-sm">
                <pre className="whitespace-pre">{getLineNumbers(code)}</pre>
              </div>
            )}
            <div className="flex-1 px-4 py-4">
              <pre 
                className="whitespace-pre font-mono text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: highlightCode(code, language) 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Language: {supportedLanguages.find(l => l.value === language)?.label}</span>
            <span>Characters: {code.length}</span>
            <span>Words: {code.split(/\s+/).filter(word => word.length > 0).length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCode}
              className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
