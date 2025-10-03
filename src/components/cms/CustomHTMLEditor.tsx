"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, Code, AlertTriangle, Copy, Download, Upload, Check, Sparkles } from "lucide-react";
import { sanitizeCustomHTML, validateHTML } from "../../lib/sanitize";

interface CustomData {
  html: string;
}

interface CustomHTMLEditorProps {
  data: CustomData;
  onChange: (data: CustomData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function CustomHTMLEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: CustomHTMLEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<CustomData>(data);
  const [isTyping, setIsTyping] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');
  const [htmlError, setHtmlError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      textareaRef.current.style.height = Math.max(200, textareaRef.current.scrollHeight) + 'px';
    }
  }, [currentData.html]);

  const handleChange = (html: string) => {
    setCurrentData({ html });
    setIsTyping(true);
    validateHTMLContent(html);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the onChange call
    timeoutRef.current = setTimeout(() => {
      onChange({ html });
      setIsTyping(false);
    }, 300);
  };

  const validateHTMLContent = (html: string) => {
    if (!html.trim()) {
      setHtmlError(null);
      return;
    }

    const validation = validateHTML(html);
    if (validation.warnings.length > 0) {
      setHtmlError(validation.warnings[0]);
    } else {
      setHtmlError(null);
    }
  };

  const highlightHTML = (html: string): string => {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)\b/g, '<span class="text-blue-600 font-semibold">$1$2</span>')
      .replace(/(&lt;[^&gt;]*?)(\s+[a-zA-Z-]+)(=)/g, '$1<span class="text-red-600">$2</span><span class="text-gray-600">$3</span>')
      .replace(/(=)(&quot;[^&quot;]*&quot;|'[^']*')/g, '<span class="text-gray-600">$1</span><span class="text-green-600">$2</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-gray-500 italic">$1</span>');
  };

  const templates = [
    {
      name: 'Alert Box',
      description: 'Colored alert/notification box',
      html: `<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
  <div class="flex items-center">
    <div class="text-blue-600 mr-3">ℹ️</div>
    <div>
      <h4 class="text-blue-800 font-semibold">Information</h4>
      <p class="text-blue-700 mt-1">Your custom message here...</p>
    </div>
  </div>
</div>`
    },
    {
      name: 'Two Column Layout',
      description: 'Responsive two-column content layout',
      html: `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">Left Column</h3>
    <p>Your content here...</p>
  </div>
  <div class="bg-gray-50 p-6 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">Right Column</h3>
    <p>Your content here...</p>
  </div>
</div>`
    },
    {
      name: 'Call to Action',
      description: 'Centered call-to-action section',
      html: `<div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-8 text-center my-8">
  <h2 class="text-2xl font-bold mb-4">Ready to Get Started?</h2>
  <p class="text-blue-100 mb-6">Join thousands of satisfied customers today.</p>
  <a href="#" class="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
    Get Started Now
  </a>
</div>`
    },
    {
      name: 'Feature Grid',
      description: 'Three-column feature showcase',
      html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
  <div class="text-center">
    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-2xl">🚀</span>
    </div>
    <h3 class="text-lg font-semibold mb-2">Fast</h3>
    <p class="text-gray-600">Lightning-fast performance</p>
  </div>
  <div class="text-center">
    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-2xl">🔒</span>
    </div>
    <h3 class="text-lg font-semibold mb-2">Secure</h3>
    <p class="text-gray-600">Bank-level security</p>
  </div>
  <div class="text-center">
    <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span class="text-2xl">⚡</span>
    </div>
    <h3 class="text-lg font-semibold mb-2">Reliable</h3>
    <p class="text-gray-600">99.9% uptime guarantee</p>
  </div>
</div>`
    }
  ];

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentData.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportHTML = () => {
    const blob = new Blob([currentData.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-html.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importHTML = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleChange(content);
      };
      reader.readAsText(file);
    }
  };

  const sanitizeCurrentHTML = () => {
    const sanitized = sanitizeCustomHTML(currentData.html);
    handleChange(sanitized);
  };

  const formatHTML = () => {
    // Basic HTML formatting
    let formatted = currentData.html;

    // Remove extra whitespace
    formatted = formatted.trim();

    // Add newlines after closing tags
    formatted = formatted.replace(/>\s*</g, '>\n<');

    // Add indentation
    let indent = 0;
    const lines = formatted.split('\n');
    formatted = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^<\//)) {
        indent = Math.max(0, indent - 1);
      }
      const indented = '  '.repeat(indent) + trimmed;
      if (trimmed.match(/^<[^/][^>]*[^/]>$/)) {
        indent++;
      }
      return indented;
    }).join('\n');

    handleChange(formatted);
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Custom HTML Block</h3>
            <p className="text-sm text-gray-700 mt-1">Add custom HTML, CSS, and interactive elements</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'editor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Code className="w-4 h-4" />
              Editor
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'preview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Split
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1.5 text-sm font-medium text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              Templates
            </button>
            <button
              onClick={formatHTML}
              className="p-1.5 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-transparent hover:border-purple-300"
              title="Format/Beautify HTML"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={copyToClipboard}
              className={`p-1.5 rounded-lg transition-colors border ${
                copied
                  ? 'text-green-700 bg-green-50 border-green-300'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-transparent hover:border-gray-300'
              }`}
              title={copied ? "Copied!" : "Copy HTML"}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={exportHTML}
              className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-300"
              title="Export HTML"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-300"
              title="Import HTML"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={sanitizeCurrentHTML}
              className="p-1.5 text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-300"
              title="Sanitize HTML"
            >
              🛡️
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={importHTML}
              className="hidden"
            />
          </div>

          {/* Error Warning */}
          {htmlError && (
            <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{htmlError}</span>
            </div>
          )}
        </div>

        {/* Templates Panel */}
        {showTemplates && (
          <div className="mt-4 border-2 border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h4 className="text-sm font-semibold text-gray-900">📋 HTML Templates</h4>
              <p className="text-xs text-gray-600 mt-0.5">Click to insert a template</p>
            </div>
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleChange(template.html);
                    setShowTemplates(false);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-0.5 group-hover:text-blue-600">{template.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="p-4">
        {viewMode === 'editor' && (
          <div className="space-y-4">
            <textarea
              ref={textareaRef}
              value={currentData.html}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="<!--Enter your custom HTML here...-->"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none font-mono text-sm leading-6"
              style={{ minHeight: '300px', tabSize: 2 }}
            />
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white min-h-[300px]">
            <div className="mb-3 pb-3 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</span>
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: currentData.html ? sanitizeCustomHTML(currentData.html) : '<p class="text-gray-400 italic text-center py-8">No HTML content to preview</p>'
              }}
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">HTML Editor</label>
              <textarea
                ref={textareaRef}
                value={currentData.html}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="<!--Enter your custom HTML here...-->"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none font-mono text-sm leading-6"
                style={{ height: '350px', tabSize: 2 }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">Live Preview</label>
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white h-[350px] overflow-auto">
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentData.html ? sanitizeCustomHTML(currentData.html) : '<p class="text-gray-400 italic text-center py-8">No HTML content to preview</p>'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-700 font-medium">
            <span className="text-gray-600">Characters:</span> {currentData.html.length} <span className="text-gray-400">•</span> <span className="text-gray-600">Lines:</span> {currentData.html.split('\n').length}
            {currentData.html.length > 10000 && (
              <span className="text-amber-700 ml-2 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⚠️ Large HTML blocks may impact performance
              </span>
            )}
          </div>
          {isTyping && (
            <div className="text-sm text-blue-600 font-medium flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}