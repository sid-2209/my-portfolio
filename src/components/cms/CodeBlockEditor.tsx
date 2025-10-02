"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Maximize2, Minimize2 } from 'lucide-react';

interface CodeBlockEditorProps {
  code: string;
  language: string;
  onChange: (code: string, language: string) => void;
  className?: string;
  filename?: string;
  onFilenameChange?: (filename: string) => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

const supportedLanguages = [
  { value: 'javascript', label: 'JavaScript', ext: '.js' },
  { value: 'typescript', label: 'TypeScript', ext: '.ts' },
  { value: 'jsx', label: 'React JSX', ext: '.jsx' },
  { value: 'tsx', label: 'React TSX', ext: '.tsx' },
  { value: 'python', label: 'Python', ext: '.py' },
  { value: 'java', label: 'Java', ext: '.java' },
  { value: 'cpp', label: 'C++', ext: '.cpp' },
  { value: 'csharp', label: 'C#', ext: '.cs' },
  { value: 'php', label: 'PHP', ext: '.php' },
  { value: 'ruby', label: 'Ruby', ext: '.rb' },
  { value: 'go', label: 'Go', ext: '.go' },
  { value: 'rust', label: 'Rust', ext: '.rs' },
  { value: 'html', label: 'HTML', ext: '.html' },
  { value: 'css', label: 'CSS', ext: '.css' },
  { value: 'scss', label: 'SCSS', ext: '.scss' },
  { value: 'json', label: 'JSON', ext: '.json' },
  { value: 'xml', label: 'XML', ext: '.xml' },
  { value: 'yaml', label: 'YAML', ext: '.yaml' },
  { value: 'markdown', label: 'Markdown', ext: '.md' },
  { value: 'sql', label: 'SQL', ext: '.sql' },
  { value: 'bash', label: 'Bash', ext: '.sh' },
  { value: 'powershell', label: 'PowerShell', ext: '.ps1' },
  { value: 'dockerfile', label: 'Dockerfile', ext: 'Dockerfile' },
  { value: 'graphql', label: 'GraphQL', ext: '.graphql' },
  { value: 'swift', label: 'Swift', ext: '.swift' },
  { value: 'kotlin', label: 'Kotlin', ext: '.kt' },
  { value: 'dart', label: 'Dart', ext: '.dart' },
  { value: 'text', label: 'Plain Text', ext: '.txt' }
];

export default function CodeBlockEditor({
  code,
  language,
  onChange,
  className = "",
  filename: propFilename,
  onFilenameChange,
  theme: propTheme,
  onThemeChange
}: CodeBlockEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);
  const [localFilename, setLocalFilename] = useState(propFilename || '');
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(propTheme || 'dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (propFilename !== undefined) {
      setLocalFilename(propFilename);
    }
  }, [propFilename]);

  useEffect(() => {
    if (propTheme !== undefined) {
      setLocalTheme(propTheme);
    }
  }, [propTheme]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadCode = () => {
    const langExt = supportedLanguages.find(l => l.value === language)?.ext || '.txt';
    const fileName = localFilename || `code${langExt}`;

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFilenameChange = (newFilename: string) => {
    setLocalFilename(newFilename);
    if (onFilenameChange) {
      onFilenameChange(newFilename);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setLocalTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const selectedThemeStyle = localTheme === 'dark' ? vscDarkPlus : vs;

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

  const editorHeight = isFullscreen ? 'h-[600px]' : 'h-64';

  return (
    <div className={`border border-gray-300 rounded-lg bg-white shadow-sm ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className={`border-b border-gray-200 ${localTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} rounded-t-lg`}>
        {/* Tab Bar */}
        <div className={`flex items-center border-b ${localTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'edit'
                ? localTheme === 'dark'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-900 border-b-2 border-blue-600'
                : localTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? localTheme === 'dark'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-900 border-b-2 border-blue-600'
                : localTheme === 'dark'
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-4">
            {/* Filename Input */}
            <input
              type="text"
              value={localFilename}
              onChange={(e) => handleFilenameChange(e.target.value)}
              placeholder="filename.ext"
              className={`px-3 py-1.5 text-sm border rounded-lg font-mono focus:ring-2 focus:ring-blue-200 ${
                localTheme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />

            <select
              value={language}
              onChange={(e) => onChange(code, e.target.value)}
              className={`px-3 py-1.5 text-sm border rounded-lg font-medium focus:ring-2 focus:ring-blue-200 ${
                localTheme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            <span className={`text-sm font-medium ${localTheme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
              {code.split('\n').length} lines
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <select
              value={localTheme}
              onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark')}
              className={`px-2 py-1 text-xs border rounded-lg font-medium focus:ring-2 focus:ring-blue-200 ${
                localTheme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>

            <label className={`flex items-center text-sm font-medium cursor-pointer ${localTheme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              Lines
            </label>

            <label className={`flex items-center text-sm font-medium cursor-pointer ${localTheme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              <input
                type="checkbox"
                checked={wrapLines}
                onChange={(e) => setWrapLines(e.target.checked)}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              Wrap
            </label>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-1.5 rounded-lg transition-colors ${
                localTheme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-200 text-gray-700'
              }`}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor - Tab Content */}
      {activeTab === 'edit' ? (
        /* Edit Tab - Plain Textarea */
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value, language)}
            className={`w-full ${editorHeight} p-4 font-mono text-sm border-0 resize-none focus:ring-0 focus:outline-none ${
              localTheme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.5',
              tabSize: 2
            }}
            placeholder="// Enter your code here..."
            spellCheck={false}
          />
        </div>
      ) : (
        /* Preview Tab - Syntax Highlighted Read-Only */
        <div className={`${editorHeight} overflow-auto ${localTheme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
          {code ? (
            <SyntaxHighlighter
              language={language}
              style={selectedThemeStyle}
              showLineNumbers={showLineNumbers}
              wrapLines={wrapLines}
              wrapLongLines={wrapLines}
              customStyle={{
                margin: 0,
                padding: '16px',
                background: 'transparent',
                fontSize: `${fontSize}px`,
                lineHeight: '1.5',
                height: '100%'
              }}
              lineNumberStyle={{
                minWidth: '3em',
                paddingRight: '1em',
                userSelect: 'none'
              }}
            >
              {code}
            </SyntaxHighlighter>
          ) : (
            <div className={`flex items-center justify-center h-full ${localTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              <p className="text-sm">No code to preview. Switch to Edit tab to add code.</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={`border-t p-3 rounded-b-lg ${localTheme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between text-xs">
          <div className={`flex items-center space-x-4 font-medium ${localTheme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
            <span>Language: <span className={localTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>{supportedLanguages.find(l => l.value === language)?.label}</span></span>
            <span>Characters: <span className={localTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>{code.length}</span></span>
            <span>Words: <span className={localTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'}>{code.split(/\s+/).filter(word => word.length > 0).length}</span></span>
            <div className="flex items-center space-x-2">
              <label className={`text-sm ${localTheme === 'dark' ? 'text-gray-400' : 'text-gray-800'}`}>Size:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className={`px-2 py-0.5 text-xs border rounded focus:ring-2 focus:ring-blue-200 ${
                  localTheme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadCode}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center gap-1.5 font-medium border ${
                localTheme === 'dark'
                  ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
              }`}
              title="Download code as file"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={handleCopyCode}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 flex items-center gap-1.5 font-medium border ${
                copied
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : localTheme === 'dark'
                  ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
