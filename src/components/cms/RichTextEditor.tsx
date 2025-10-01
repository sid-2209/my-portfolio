"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sanitizeRichText } from "../../lib/sanitize";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  isEditing?: boolean;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className = "",
  isEditing = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [embeddedLinkUrl, setEmbeddedLinkUrl] = useState('');
  const [embeddedLinkText, setEmbeddedLinkText] = useState('');
  const [activeFormatting, setActiveFormatting] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    alignLeft: boolean;
    alignCenter: boolean;
    alignRight: boolean;
    unorderedList: boolean;
    orderedList: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    unorderedList: false,
    orderedList: false,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastContentRef = useRef(content);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

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

  // Function to fix existing links with proper protocols
  const fixExistingLinks = (htmlContent: string) => {
    // Create a temporary div to parse and fix HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Find all links and fix their href attributes
    const links = tempDiv.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//') && !href.startsWith('#')) {
        link.setAttribute('href', 'https://' + href);
        console.log('Fixed link:', href, '→', 'https://' + href);
      }
    });
    
    return tempDiv.innerHTML;
  };

  // Initialize editor content only once
  useEffect(() => {
    if (mounted && !isInitialized && editorRef.current) {
      const fixedContent = fixExistingLinks(content);
      if (fixedContent && fixedContent.trim() !== '') {
        editorRef.current.innerHTML = fixedContent;
        setShowPlaceholder(false);
      } else {
        editorRef.current.innerHTML = '';
        setShowPlaceholder(true);
      }

      setIsInitialized(true);
    }
  }, [mounted, content, isInitialized, isEditing]);

  // Handle external content updates (only when not typing)
  useEffect(() => {
    if (mounted && isInitialized && !isTyping && content !== lastContentRef.current) {
      if (editorRef.current) {
        const fixedContent = fixExistingLinks(content);
        editorRef.current.innerHTML = fixedContent;
        lastContentRef.current = fixedContent;
      }
    }
  }, [mounted, isInitialized, content, isTyping]);

  const handleInput = () => {
    if (editorRef.current) {
      let newContent = editorRef.current.innerHTML;
      
      // Update placeholder state based on content
      if (newContent.trim() === '') {
        setShowPlaceholder(true);
      } else {
        setShowPlaceholder(false);
      }
      
      // Fix any links that might not have proper protocols
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;
      const links = tempDiv.querySelectorAll('a[href]');
      let contentChanged = false;
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('//') && !href.startsWith('#')) {
          link.setAttribute('href', 'https://' + href);
          contentChanged = true;
          console.log('Fixed link before saving:', href, '→', 'https://' + href);
        }
      });
      
      if (contentChanged) {
        newContent = tempDiv.innerHTML;
        // Update the editor with the fixed content
        editorRef.current.innerHTML = newContent;
      }
      
      setIsTyping(true);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Debounce the onChange call to parent
      timeoutRef.current = setTimeout(() => {
        // Sanitize content before saving
        const sanitizedContent = sanitizeRichText(newContent);
        onChange(sanitizedContent);
        lastContentRef.current = sanitizedContent;
        setIsTyping(false);
      }, 300); // 300ms delay
    }
  };

  const updateActiveFormatting = useCallback(() => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Check parent elements for formatting
        let element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;
        
        const newFormatting = {
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          alignLeft: false,
          alignCenter: false,
          alignRight: false,
          unorderedList: false,
          orderedList: false,
        };
        
        // Reset all alignment flags first
        let hasAlignment = false;
        
        while (element && element !== editorRef.current) {
          if (element.tagName === 'STRONG' || element.tagName === 'B') {
            newFormatting.bold = true;
          } else if (element.tagName === 'EM' || element.tagName === 'I') {
            newFormatting.italic = true;
          } else if ((element as HTMLElement).style.textDecoration === 'underline') {
            newFormatting.underline = true;
          } else if ((element as HTMLElement).style.textDecoration === 'line-through') {
            newFormatting.strike = true;
          } else if ((element as HTMLElement).style.textAlign) {
            // Only set one alignment at a time
            if (!hasAlignment) {
              const textAlign = (element as HTMLElement).style.textAlign;
              if (textAlign === 'left') {
                newFormatting.alignLeft = true;
                hasAlignment = true;
              } else if (textAlign === 'center') {
                newFormatting.alignCenter = true;
                hasAlignment = true;
              } else if (textAlign === 'right') {
                newFormatting.alignRight = true;
                hasAlignment = true;
              }
            }
          } else if (element.tagName === 'UL') {
            newFormatting.unorderedList = true;
          } else if (element.tagName === 'OL') {
            newFormatting.orderedList = true;
          }
          element = element.parentElement;
        }
        
        setActiveFormatting(newFormatting);
      } else {
        // No selection, reset formatting
        setActiveFormatting({
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          alignLeft: false,
          alignCenter: false,
          alignRight: false,
          unorderedList: false,
          orderedList: false,
        });
      }
    }
  }, []);

  const formatText = (command: string, value?: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        switch (command) {
          case 'bold':
            const boldSpan = document.createElement('strong');
            boldSpan.style.fontWeight = 'bold';
                    try {
          range.surroundContents(boldSpan);
        } catch {
          // If surroundContents fails, use insertNode
          const contents = range.extractContents();
          boldSpan.appendChild(contents);
          range.insertNode(boldSpan);
        }
            break;
            
          case 'italic':
            const italicSpan = document.createElement('em');
            italicSpan.style.fontStyle = 'italic';
                    try {
          range.surroundContents(italicSpan);
        } catch {
          const contents = range.extractContents();
          italicSpan.appendChild(contents);
          range.insertNode(italicSpan);
        }
            break;
            
          case 'underline':
            const underlineSpan = document.createElement('span');
            underlineSpan.style.textDecoration = 'underline';
                    try {
          range.surroundContents(underlineSpan);
        } catch {
          const contents = range.extractContents();
          underlineSpan.appendChild(contents);
          range.insertNode(underlineSpan);
        }
            break;
            
          case 'strikeThrough':
            const strikeSpan = document.createElement('span');
            strikeSpan.style.textDecoration = 'line-through';
                    try {
          range.surroundContents(strikeSpan);
        } catch {
          const contents = range.extractContents();
          strikeSpan.appendChild(contents);
          range.insertNode(strikeSpan);
        }
            break;
            
          case 'formatBlock':
            const blockElement = document.createElement(value || 'p');
                    try {
          range.surroundContents(blockElement);
        } catch {
          const contents = range.extractContents();
          blockElement.appendChild(contents);
          range.insertNode(blockElement);
        }
            break;
            
          case 'insertUnorderedList':
            // Check if selection is already in a list
            let parentList = range.commonAncestorContainer.parentElement;
            while (parentList && parentList.tagName !== 'UL' && parentList.tagName !== 'OL') {
              parentList = parentList.parentElement;
            }
            
            if (parentList && parentList.tagName === 'UL') {
              // Already in unordered list, do nothing
              break;
            }
            
            const ul = document.createElement('ul');
            ul.style.margin = '8px 0';
            ul.style.paddingLeft = '24px';
            ul.style.listStyleType = 'disc';
            ul.style.color = '#374151';
            
            const li = document.createElement('li');
            li.style.margin = '4px 0';
            li.style.lineHeight = '1.5';
            
            const contents = range.extractContents();
            li.appendChild(contents);
            ul.appendChild(li);
            range.insertNode(ul);
            break;
            
          case 'insertOrderedList':
            // Check if selection is already in a list
            let parentOrderedList = range.commonAncestorContainer.parentElement;
            while (parentOrderedList && parentOrderedList.tagName !== 'UL' && parentOrderedList.tagName !== 'OL') {
              parentOrderedList = parentOrderedList.parentElement;
            }
            
            if (parentOrderedList && parentOrderedList.tagName === 'OL') {
              // Already in ordered list, do nothing
              break;
            }
            
            const ol = document.createElement('ol');
            ol.style.margin = '8px 0';
            ol.style.paddingLeft = '24px';
            ol.style.listStyleType = 'decimal';
            ol.style.color = '#374151';
            
            const oli = document.createElement('li');
            oli.style.margin = '4px 0';
            oli.style.lineHeight = '1.5';
            
            const ocontents = range.extractContents();
            oli.appendChild(ocontents);
            ol.appendChild(oli);
            range.insertNode(ol);
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
            
          default:
            // For any other commands, we can either implement them specifically
            // or simply log that they're not implemented rather than using deprecated execCommand
            console.warn(`Command "${command}" is not implemented with modern Selection API. Consider implementing it if needed.`);
        }
        
        // Clear selection and focus
        selection.removeAllRanges();
        editorRef.current.focus();
        handleInput();
        
        // Update active formatting state
        setTimeout(updateActiveFormatting, 10);
      }
    }
  };

  const insertLink = () => {
    // If no text is selected, create a text node at cursor position
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
          // Insert a space if cursor is at empty position
          const spaceNode = document.createTextNode('\u00A0'); // Non-breaking space
          range.insertNode(spaceNode);
          range.setStartAfter(spaceNode);
          range.setEndAfter(spaceNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
    setShowLinkEditor(true);
    setEmbeddedLinkUrl('');
    setEmbeddedLinkText('');
  };

  const handleInsertLink = () => {
    if (embeddedLinkUrl) {
      if (editorRef.current) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const linkElement = document.createElement('a');
          
          // Ensure URL has proper protocol
          let url = embeddedLinkUrl.trim();
          if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
            url = 'https://' + url;
          }
          
          // Log for debugging
          console.log('Original URL:', embeddedLinkUrl);
          console.log('Processed URL:', url);
          
          linkElement.href = url;
          linkElement.textContent = embeddedLinkText || embeddedLinkUrl;
          linkElement.style.color = 'inherit'; // Use inherited text color
          linkElement.style.textDecoration = 'underline';
          linkElement.style.cursor = 'pointer';
          linkElement.style.fontWeight = 'bold';
          linkElement.style.backgroundColor = 'transparent'; // No background
          linkElement.style.padding = '0'; // No padding
          linkElement.style.borderRadius = '0'; // No border radius
          linkElement.className = 'inline-link';
          
          // Insert the link element
          range.deleteContents();
          range.insertNode(linkElement);
          
          // Move cursor after the link and focus
          range.setStartAfter(linkElement);
          range.setEndAfter(linkElement);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Focus the editor and trigger input
          editorRef.current.focus();
          handleInput();
        }
      }
    }
    setShowLinkEditor(false);
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
        {/* Row 1: Text Formatting & Style */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            {/* Text Formatting Group */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-600 mr-2">Format:</span>
              <button
                onClick={() => formatText('bold')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeFormatting.bold
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Bold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
                </svg>
                <span className="text-sm font-medium">Bold</span>
              </button>
              <button
                onClick={() => formatText('italic')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeFormatting.italic
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Italic"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-sm font-medium">Italic</span>
              </button>
              <button
                onClick={() => formatText('underline')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeFormatting.underline
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span className="text-sm font-medium">Underline</span>
              </button>
              <button
                onClick={() => formatText('strikeThrough')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeFormatting.strike
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Strikethrough"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15l1.5 1.5M7 9l1.5-1.5M3 3l18 18" />
                </svg>
                <span className="text-sm font-medium">Strike</span>
              </button>
            </div>
            
            {/* Vertical Divider */}
            <div className="w-px h-8 bg-gray-300"></div>
            
            {/* Headings Group */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Style:</span>
              <select
                onChange={(e) => {
                  if (e.target.value === 'p') {
                    formatText('formatBlock', 'p');
                  } else {
                    formatText('formatBlock', e.target.value);
                  }
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 font-medium"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
              </select>
            </div>
            
            {/* Vertical Divider */}
            <div className="w-px h-8 bg-gray-300"></div>
            

          </div>
        </div>
        
        {/* Row 2: Text Alignment, Lists & Insert Elements */}
        <div className="flex items-center space-x-6">
          {/* Text Alignment Group */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 mr-2">Align:</span>
            <button
              onClick={() => formatText('justifyLeft')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                activeFormatting.alignLeft
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Align Left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Left</span>
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                activeFormatting.alignCenter
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Align Center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Center</span>
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                activeFormatting.alignRight
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
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
          
          {/* Lists Group */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 mr-2">Lists:</span>
            <button
              onClick={() => formatText('insertUnorderedList')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                activeFormatting.unorderedList
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Bullet List"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Bullet</span>
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                activeFormatting.orderedList
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Numbered List"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20h14M7 4h14M7 12h14M3 20h.01M3 4h.01M3 12h.01" />
              </svg>
              <span className="text-sm font-medium">Numbered</span>
            </button>
          </div>
          
          {/* Vertical Divider */}
          <div className="w-px h-8 bg-gray-300"></div>
          
          {/* Insert Elements Group */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 mr-2">Insert:</span>
            <button
              onClick={insertLink}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Insert Link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm font-medium">Link</span>
            </button>


          </div>
        </div>
      </div>



      {showLinkEditor && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Insert Link</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">URL:</label>
                <input
                  type="url"
                  value={embeddedLinkUrl}
                  onChange={(e) => setEmbeddedLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Link Text (optional):</label>
                <input
                  type="text"
                  value={embeddedLinkText}
                  onChange={(e) => setEmbeddedLinkText(e.target.value)}
                  placeholder="Enter link text..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowLinkEditor(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

              {/* Editor Content */}
        <div className="p-4">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={updateActiveFormatting}
            onKeyUp={updateActiveFormatting}
            onSelect={updateActiveFormatting}
            onFocus={() => {
              // Hide placeholder instantly when focused
              setShowPlaceholder(false);

            }}
            onBlur={() => {
              // Show placeholder when empty and not focused
              if (editorRef.current && editorRef.current.textContent === '') {
                setShowPlaceholder(true);

              }
            }}
            onKeyDown={(e) => {
              // Hide placeholder on first keystroke
              if (e.key.length === 1) {
                setShowPlaceholder(false);

              }
            }}
            className={`min-h-64 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 rich-text-editor ${!showPlaceholder ? 'no-placeholder' : ''}`}
            style={{ minHeight: '200px' }}
            data-placeholder={isEditing ? placeholder : "Click edit button to create your paragraph"}

          />
        {isTyping && (
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Saving...
          </div>
        )}
      </div>
    </div>
  );
}
