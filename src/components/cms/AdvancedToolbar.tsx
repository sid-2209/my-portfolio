"use client";

import { useState } from "react";

interface AdvancedToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onInsert: (type: string, data?: unknown) => void;
  className?: string;
}

export default function AdvancedToolbar({ onFormat, onInsert, className = "" }: AdvancedToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkData, setLinkData] = useState({ url: '', text: '' });

  const handleInsertLink = () => {
    if (linkData.url && linkData.text) {
      onInsert('link', linkData);
      setLinkData({ url: '', text: '' });
      setShowLinkDialog(false);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `
      <table class="border-collapse border border-gray-300 w-full my-4">
        <thead>
          <tr>
            <th class="border border-gray-300 px-4 py-2 bg-gray-100">Header 1</th>
            <th class="border border-gray-300 px-4 py-2 bg-gray-100">Header 2</th>
            <th class="border border-gray-300 px-4 py-2 bg-gray-100">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 px-4 py-2">Cell 1</td>
            <td class="border border-gray-300 px-4 py-2">Cell 2</td>
            <td class="border border-gray-300 px-4 py-2">Cell 3</td>
          </tr>
          <tr>
            <td class="border border-gray-300 px-4 py-2">Cell 4</td>
            <td class="border border-gray-300 px-4 py-2">Cell 5</td>
            <td class="border border-gray-300 px-4 py-2">Cell 6</td>
          </tr>
        </tbody>
      </table>
    `;
    onInsert('html', tableHtml);
  };

  const handleInsertImage = () => {
    const imageUrl = prompt('Enter image URL:');
    const altText = prompt('Enter alt text (optional):');
    if (imageUrl) {
      onInsert('image', { url: imageUrl, alt: altText || '' });
    }
  };

  const handleInsertVideo = () => {
    const videoUrl = prompt('Enter video URL (YouTube, Vimeo, etc.):');
    if (videoUrl) {
      onInsert('video', { url: videoUrl });
    }
  };

  const handleInsertCallout = () => {
    const calloutText = prompt('Enter callout text:');
    const calloutType = prompt('Enter callout type (info, warning, success, error):') || 'info';
    if (calloutText) {
      const calloutHtml = `
        <div class="border-l-4 p-4 my-4 rounded-r-lg ${
          calloutType === 'info' ? 'border-blue-400 bg-blue-50' :
          calloutType === 'warning' ? 'border-yellow-400 bg-yellow-50' :
          calloutType === 'success' ? 'border-green-400 bg-green-50' :
          'border-red-400 bg-red-50'
        }">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 ${
                calloutType === 'info' ? 'text-blue-400' :
                calloutType === 'warning' ? 'text-yellow-400' :
                calloutType === 'success' ? 'text-green-400' :
                'text-red-400'
              }" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm ${
                calloutType === 'info' ? 'text-blue-700' :
                calloutType === 'warning' ? 'text-yellow-700' :
                calloutType === 'success' ? 'text-green-700' :
                'text-red-700'
              }">
                ${calloutText}
              </p>
            </div>
          </div>
        </div>
      `;
      onInsert('html', calloutHtml);
    }
  };

  return (
    <div className={`border-b border-gray-200 p-3 bg-gray-50 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Text Formatting */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => onFormat('bold')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Bold (Ctrl+B)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a1 1 0 011-1h5.5a3.5 3.5 0 013.5 3.5v1a3.5 3.5 0 01-3.5 3.5H6a1 1 0 00-1 1v2a1 1 0 001 1h4.5a3.5 3.5 0 013.5 3.5v1a3.5 3.5 0 01-3.5 3.5H6a1 1 0 01-1-1V4z"/>
              </svg>
            </button>
            <button
              onClick={() => onFormat('italic')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Italic (Ctrl+I)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 000 2h1.5l-3 8H6a1 1 0 100 2h4a1 1 0 100-2h-1.5l3-8H12a1 1 0 100-2H8z"/>
              </svg>
            </button>
            <button
              onClick={() => onFormat('underline')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Underline (Ctrl+U)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
            </button>
            <button
              onClick={() => onFormat('strikeThrough')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Strikethrough"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <select
              onChange={(e) => {
                if (e.target.value === 'p') {
                  onFormat('formatBlock', 'p');
                } else {
                  onFormat('formatBlock', e.target.value);
                }
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
            </select>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => onFormat('insertUnorderedList')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Bullet List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
            <button
              onClick={() => onFormat('insertOrderedList')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Numbered List"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
          </div>

          {/* Insert Elements */}
          <div className="flex items-center space-x-1 border-r border-gray-300 pr-2">
            <button
              onClick={() => setShowLinkDialog(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Link"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
              </svg>
            </button>
            <button
              onClick={handleInsertImage}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Image"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              onClick={handleInsertTable}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Table"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
          </div>

          {/* Special Elements */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onFormat('insertHorizontalRule')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Horizontal Rule"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm0 4a1 1 0 000 2h1a1 1 0 000-2H3zm4-8a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h9a1 1 0 110 2H8a1 1 0 01-1-1z"/>
              </svg>
            </button>
            <button
              onClick={handleInsertCallout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Insert Callout"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onFormat('removeFormat')}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Remove Formatting"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkData.text}
                  onChange={(e) => setLinkData(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
