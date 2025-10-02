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
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showCaseMenu, setShowCaseMenu] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);
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

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const isUndoRedoAction = useRef(false);

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

  // ESC key handler to close all dropdowns
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTextColorPicker(false);
        setShowHighlightPicker(false);
        setShowCaseMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
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

      // Push to undo stack (unless this is an undo/redo action)
      if (!isUndoRedoAction.current && lastContentRef.current !== newContent) {
        setUndoStack(prev => [...prev, lastContentRef.current]);
        setRedoStack([]); // Clear redo stack on new change
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

  // Helper function to check if selection has specific formatting
  const hasFormatting = (tagName: string, styleProperty?: string, styleValue?: string): boolean => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer as HTMLElement;

    while (element && element !== editorRef.current) {
      if (element.tagName === tagName.toUpperCase()) {
        if (styleProperty && styleValue) {
          return element.style[styleProperty as any] === styleValue;
        }
        return true;
      }
      if (styleProperty && element.style && element.style[styleProperty as any] === styleValue) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  };

  // Helper function to unwrap/remove formatting
  const unwrapFormatting = (tagName: string, styleProperty?: string, styleValue?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    let element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer as HTMLElement;

    while (element && element !== editorRef.current) {
      const shouldUnwrap =
        element.tagName === tagName.toUpperCase() ||
        (styleProperty && element.style && element.style[styleProperty as any] === styleValue);

      if (shouldUnwrap) {
        // Get parent before unwrapping
        const parent = element.parentNode;
        if (parent) {
          // Move all children out of the element
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          // Remove the now-empty element
          parent.removeChild(element);
        }
        break;
      }
      element = element.parentElement;
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
        let skipDefaultCleanup = false;

        switch (command) {
          case 'bold':
            // Toggle: if already bold, remove it; otherwise add it
            if (hasFormatting('strong')) {
              unwrapFormatting('strong');
            } else {
              const boldSpan = document.createElement('strong');
              boldSpan.style.fontWeight = 'bold';
              try {
                range.surroundContents(boldSpan);
              } catch {
                const contents = range.extractContents();
                boldSpan.appendChild(contents);
                range.insertNode(boldSpan);
              }
            }
            break;

          case 'italic':
            // Toggle: if already italic, remove it; otherwise add it
            if (hasFormatting('em')) {
              unwrapFormatting('em');
            } else {
              const italicSpan = document.createElement('em');
              italicSpan.style.fontStyle = 'italic';
              try {
                range.surroundContents(italicSpan);
              } catch {
                const contents = range.extractContents();
                italicSpan.appendChild(contents);
                range.insertNode(italicSpan);
              }
            }
            break;

          case 'underline':
            // Toggle: if already underlined, remove it; otherwise add it
            if (hasFormatting('span', 'textDecoration', 'underline')) {
              unwrapFormatting('span', 'textDecoration', 'underline');
            } else {
              const underlineSpan = document.createElement('span');
              underlineSpan.style.textDecoration = 'underline';
              try {
                range.surroundContents(underlineSpan);
              } catch {
                const contents = range.extractContents();
                underlineSpan.appendChild(contents);
                range.insertNode(underlineSpan);
              }
            }
            break;

          case 'strikeThrough':
            // Toggle: if already strikethrough, remove it; otherwise add it
            if (hasFormatting('span', 'textDecoration', 'line-through')) {
              unwrapFormatting('span', 'textDecoration', 'line-through');
            } else {
              const strikeSpan = document.createElement('span');
              strikeSpan.style.textDecoration = 'line-through';
              try {
                range.surroundContents(strikeSpan);
              } catch {
                const contents = range.extractContents();
                strikeSpan.appendChild(contents);
                range.insertNode(strikeSpan);
              }
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

          case 'inlineCode':
            const codeSpan = document.createElement('code');
            codeSpan.style.backgroundColor = '#f3f4f6';
            codeSpan.style.color = '#dc2626';
            codeSpan.style.padding = '2px 6px';
            codeSpan.style.borderRadius = '4px';
            codeSpan.style.fontFamily = 'monospace';
            codeSpan.style.fontSize = '0.9em';
                    try {
          range.surroundContents(codeSpan);
        } catch {
          const contents = range.extractContents();
          codeSpan.appendChild(contents);
          range.insertNode(codeSpan);
        }
            break;

          case 'blockQuote':
            const blockquote = document.createElement('blockquote');
            blockquote.style.borderLeft = '4px solid #3b82f6';
            blockquote.style.paddingLeft = '16px';
            blockquote.style.margin = '16px 0';
            blockquote.style.fontStyle = 'italic';
            blockquote.style.color = '#6b7280';
                    try {
          range.surroundContents(blockquote);
        } catch {
          const contents = range.extractContents();
          blockquote.appendChild(contents);
          range.insertNode(blockquote);
        }
            break;

          case 'textColor':
            if (value) {
              const colorSpan = document.createElement('span');
              colorSpan.style.color = value;
              try {
                range.surroundContents(colorSpan);
              } catch {
                const contents = range.extractContents();
                colorSpan.appendChild(contents);
                range.insertNode(colorSpan);
              }
            }
            break;

          case 'highlight':
            if (value) {
              const highlightSpan = document.createElement('span');
              highlightSpan.style.backgroundColor = value;
              highlightSpan.style.padding = '2px 4px';
              highlightSpan.style.borderRadius = '3px';
              try {
                range.surroundContents(highlightSpan);
              } catch {
                const contents = range.extractContents();
                highlightSpan.appendChild(contents);
                range.insertNode(highlightSpan);
              }
            }
            break;

          case 'superscript':
            const supElement = document.createElement('sup');
            supElement.style.fontSize = '0.75em';
            supElement.style.verticalAlign = 'super';
            try {
              range.surroundContents(supElement);
            } catch {
              const contents = range.extractContents();
              supElement.appendChild(contents);
              range.insertNode(supElement);
            }
            // Move cursor outside the sup element to prevent persistence
            const spaceAfterSup = document.createTextNode('\u200B'); // Zero-width space
            supElement.parentNode?.insertBefore(spaceAfterSup, supElement.nextSibling);
            range.setStartAfter(spaceAfterSup);
            range.setEndAfter(spaceAfterSup);
            selection.removeAllRanges();
            selection.addRange(range);
            skipDefaultCleanup = true; // We handled selection ourselves
            break;

          case 'subscript':
            const subElement = document.createElement('sub');
            subElement.style.fontSize = '0.75em';
            subElement.style.verticalAlign = 'sub';
            try {
              range.surroundContents(subElement);
            } catch {
              const contents = range.extractContents();
              subElement.appendChild(contents);
              range.insertNode(subElement);
            }
            // Move cursor outside the sub element to prevent persistence
            const spaceAfterSub = document.createTextNode('\u200B'); // Zero-width space
            subElement.parentNode?.insertBefore(spaceAfterSub, subElement.nextSibling);
            range.setStartAfter(spaceAfterSub);
            range.setEndAfter(spaceAfterSub);
            selection.removeAllRanges();
            selection.addRange(range);
            skipDefaultCleanup = true; // We handled selection ourselves
            break;

          default:
            // For any other commands, we can either implement them specifically
            // or simply log that they're not implemented rather than using deprecated execCommand
            console.warn(`Command "${command}" is not implemented with modern Selection API. Consider implementing it if needed.`);
        }

        // Clear selection and focus (unless we handled it manually)
        if (!skipDefaultCleanup) {
          selection.removeAllRanges();
        }
        editorRef.current.focus();
        handleInput();

        // Update active formatting state
        setTimeout(updateActiveFormatting, 10);
      }
    }
  };

  const insertLink = () => {
    // Save the current selection/range before opening modal
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        // Clone and save the range
        savedRangeRef.current = range.cloneRange();

        if (range.collapsed) {
          // Insert a placeholder space if cursor is at empty position
          const spaceNode = document.createTextNode('\u00A0'); // Non-breaking space
          range.insertNode(spaceNode);
          range.setStartAfter(spaceNode);
          range.setEndAfter(spaceNode);
          selection.removeAllRanges();
          selection.addRange(range);
          // Update saved range with the new position
          savedRangeRef.current = range.cloneRange();
        }
      }
    }
    setShowLinkEditor(true);
    setEmbeddedLinkUrl('');
    setEmbeddedLinkText('');
  };

  const handleInsertLink = () => {
    if (embeddedLinkUrl && editorRef.current) {
      // Focus editor first
      editorRef.current.focus();

      // Restore the saved selection/range
      const selection = window.getSelection();
      if (selection && savedRangeRef.current) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);

        const range = savedRangeRef.current;
        const linkElement = document.createElement('a');

        // Ensure URL has proper protocol
        let url = embeddedLinkUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('//')) {
          url = 'https://' + url;
        }

        linkElement.href = url;
        linkElement.textContent = embeddedLinkText || embeddedLinkUrl;
        linkElement.style.color = 'inherit';
        linkElement.style.textDecoration = 'underline';
        linkElement.style.cursor = 'pointer';
        linkElement.style.fontWeight = 'bold';
        linkElement.style.backgroundColor = 'transparent';
        linkElement.style.padding = '0';
        linkElement.style.borderRadius = '0';
        linkElement.className = 'inline-link';

        // Insert the link element
        range.deleteContents();
        range.insertNode(linkElement);

        // Move cursor after the link
        range.setStartAfter(linkElement);
        range.setEndAfter(linkElement);
        selection.removeAllRanges();
        selection.addRange(range);

        // Trigger input handler
        handleInput();

        // Clear saved range
        savedRangeRef.current = null;
      }
    }
    setShowLinkEditor(false);
  };

  const handleUndo = () => {
    if (undoStack.length > 0 && editorRef.current) {
      const previousContent = undoStack[undoStack.length - 1];
      const currentContent = editorRef.current.innerHTML;

      // Push current content to redo stack
      setRedoStack(prev => [...prev, currentContent]);

      // Remove last item from undo stack
      setUndoStack(prev => prev.slice(0, -1));

      // Set flag to prevent pushing to undo stack
      isUndoRedoAction.current = true;

      // Update editor content
      editorRef.current.innerHTML = previousContent;
      lastContentRef.current = previousContent;
      onChange(previousContent);

      // Reset flag after a short delay
      setTimeout(() => {
        isUndoRedoAction.current = false;
      }, 100);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0 && editorRef.current) {
      const nextContent = redoStack[redoStack.length - 1];
      const currentContent = editorRef.current.innerHTML;

      // Push current content to undo stack
      setUndoStack(prev => [...prev, currentContent]);

      // Remove last item from redo stack
      setRedoStack(prev => prev.slice(0, -1));

      // Set flag to prevent pushing to undo stack
      isUndoRedoAction.current = true;

      // Update editor content
      editorRef.current.innerHTML = nextContent;
      lastContentRef.current = nextContent;
      onChange(nextContent);

      // Reset flag after a short delay
      setTimeout(() => {
        isUndoRedoAction.current = false;
      }, 100);
    }
  };

  const transformTextCase = (caseType: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText) {
          let transformedText = '';

          switch (caseType) {
            case 'upper':
              transformedText = selectedText.toUpperCase();
              break;
            case 'lower':
              transformedText = selectedText.toLowerCase();
              break;
            case 'title':
              transformedText = selectedText.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
              break;
            case 'sentence':
              transformedText = selectedText.toLowerCase().replace(/(^\w|\.\s+\w)/g, char => char.toUpperCase());
              break;
          }

          const textNode = document.createTextNode(transformedText);
          range.deleteContents();
          range.insertNode(textNode);
          selection.removeAllRanges();
          editorRef.current.focus();
          handleInput();
        }
      }
    }
    setShowCaseMenu(false);
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
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        {/* Single Row Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Text Formatting Group */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => formatText('bold')}
                className={`p-2 rounded-lg transition-colors ${
                  activeFormatting.bold
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Bold (Ctrl+B)"
                aria-label="Bold"
                aria-pressed={activeFormatting.bold}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                </svg>
              </button>
              <button
                onClick={() => formatText('italic')}
                className={`p-2 rounded-lg transition-colors ${
                  activeFormatting.italic
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Italic (Ctrl+I)"
                aria-label="Italic"
                aria-pressed={activeFormatting.italic}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
                </svg>
              </button>
              <button
                onClick={() => formatText('underline')}
                className={`p-2 rounded-lg transition-colors ${
                  activeFormatting.underline
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Underline (Ctrl+U)"
                aria-label="Underline"
                aria-pressed={activeFormatting.underline}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
                </svg>
              </button>
              <button
                onClick={() => formatText('strikeThrough')}
                className={`p-2 rounded-lg transition-colors ${
                  activeFormatting.strike
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Strikethrough"
                aria-label="Strikethrough"
                aria-pressed={activeFormatting.strike}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
                </svg>
              </button>
              <button
                onClick={() => formatText('superscript')}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Superscript"
                aria-label="Superscript"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 7h-2v1h3v1h-4V7c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 20h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 6h-2.68l-3.07 4.99h-.12L8.85 6H6.19l4.32 6.73L5.88 20z"/>
                </svg>
              </button>
              <button
                onClick={() => formatText('subscript')}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Subscript"
                aria-label="Subscript"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 18h-2v1h3v1h-4v-2c0-.55.45-1 1-1h2c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1zM5.88 18h2.66l3.4-5.42h.12l3.4 5.42h2.66l-4.65-7.27L17.81 4h-2.68l-3.07 4.99h-.12L8.85 4H6.19l4.32 6.73L5.88 18z"/>
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowCaseMenu(!showCaseMenu)}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Change Case"
                  aria-label="Change Case"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/>
                  </svg>
                </button>
                {showCaseMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50 min-w-[160px]">
                    <button
                      onClick={() => transformTextCase('upper')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 transition-colors first:rounded-t-xl font-medium"
                    >
                      UPPERCASE
                    </button>
                    <button
                      onClick={() => transformTextCase('lower')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 transition-colors font-medium"
                    >
                      lowercase
                    </button>
                    <button
                      onClick={() => transformTextCase('title')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 transition-colors font-medium"
                    >
                      Title Case
                    </button>
                    <button
                      onClick={() => transformTextCase('sentence')}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-gray-100 transition-colors last:rounded-b-xl font-medium"
                    >
                      Sentence case
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (editorRef.current) {
                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                      const range = selection.getRangeAt(0);
                      const selectedText = range.toString();
                      if (selectedText) {
                        // Remove all formatting, keep just text
                        const textNode = document.createTextNode(selectedText);
                        range.deleteContents();
                        range.insertNode(textNode);
                        selection.removeAllRanges();
                        editorRef.current.focus();
                        handleInput();
                      }
                    }
                  }
                }}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Clear Formatting (Ctrl+\)"
                aria-label="Clear Formatting"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6zm14 14l-1.41-1.41-3.54-3.54-1.41-1.41-3.54-3.54-1.41-1.41L6.41 5.41 5 6.82 8.17 10l-1.72 4h2.4l.9-2.11 1.9 1.9L9.46 19H12l1.17-2.72 4.84 4.84L19.41 20z"/>
                </svg>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-gray-300"></div>

            {/* Undo/Redo Group */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  undoStack.length === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                </svg>
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className={`p-2 rounded-lg transition-colors ${
                  redoStack.length === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Redo (Ctrl+Shift+Z)"
                aria-label="Redo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
                </svg>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="w-px h-8 bg-gray-300"></div>
            
            {/* Headings Group */}
            <div className="flex items-center">
              <select
                onChange={(e) => {
                  if (e.target.value === 'p') {
                    formatText('formatBlock', 'p');
                  } else {
                    formatText('formatBlock', e.target.value);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                title="Paragraph Style"
                aria-label="Paragraph Style"
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

          {/* Text Alignment Group */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => formatText('justifyLeft')}
              className={`p-2 rounded-lg transition-colors ${
                activeFormatting.alignLeft
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Align Left"
              aria-label="Align Left"
              aria-pressed={activeFormatting.alignLeft}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
              </svg>
            </button>
            <button
              onClick={() => formatText('justifyCenter')}
              className={`p-2 rounded-lg transition-colors ${
                activeFormatting.alignCenter
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Align Center"
              aria-label="Align Center"
              aria-pressed={activeFormatting.alignCenter}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
              </svg>
            </button>
            <button
              onClick={() => formatText('justifyRight')}
              className={`p-2 rounded-lg transition-colors ${
                activeFormatting.alignRight
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Align Right"
              aria-label="Align Right"
              aria-pressed={activeFormatting.alignRight}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
              </svg>
            </button>
          </div>
          
          {/* Vertical Divider */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Lists Group */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => formatText('insertUnorderedList')}
              className={`p-2 rounded-lg transition-colors ${
                activeFormatting.unorderedList
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Bullet List"
              aria-label="Bullet List"
              aria-pressed={activeFormatting.unorderedList}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
              </svg>
            </button>
            <button
              onClick={() => formatText('insertOrderedList')}
              className={`p-2 rounded-lg transition-colors ${
                activeFormatting.orderedList
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              title="Numbered List"
              aria-label="Numbered List"
              aria-pressed={activeFormatting.orderedList}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
              </svg>
            </button>
          </div>
          
          {/* Vertical Divider */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Insert Elements Group */}
          <div className="flex items-center space-x-1">
            <button
              onClick={insertLink}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Insert Link (Ctrl+K)"
              aria-label="Insert Link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button
              onClick={() => formatText('inlineCode')}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Inline Code (Ctrl+E)"
              aria-label="Inline Code"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </button>
            <button
              onClick={() => formatText('blockQuote')}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Block Quote"
              aria-label="Block Quote"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
            </button>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Color Group */}
          <div className="flex items-center space-x-1">
            <div className="relative">
              <button
                onClick={() => {
                  setShowTextColorPicker(!showTextColorPicker);
                  setShowHighlightPicker(false);
                }}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Text Color"
                aria-label="Text Color"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.62 12L12 5.67 14.38 12M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2z"/>
                </svg>
              </button>
              {showTextColorPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50">
                  <div className="grid grid-cols-5 gap-2">
                    {['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db',
                      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
                      '#ec4899', '#f43f5e', '#ffffff'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          formatText('textColor', color);
                          setShowTextColorPicker(false);
                        }}
                        className="w-7 h-7 rounded-md border-2 border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowTextColorPicker(false);
                }}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                title="Highlight Color"
                aria-label="Highlight Color"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/>
                </svg>
              </button>
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white border-2 border-gray-300 rounded-xl shadow-lg z-50">
                  <div className="grid grid-cols-5 gap-2">
                    {['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b',
                      '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c',
                      '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626',
                      '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a',
                      '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb',
                      '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed'].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          formatText('highlight', color);
                          setShowHighlightPicker(false);
                        }}
                        className="w-7 h-7 rounded-md border-2 border-gray-300 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>



      {showLinkEditor && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowLinkEditor(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Insert Link</h4>
              <button
                onClick={() => setShowLinkEditor(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={embeddedLinkUrl}
                  onChange={(e) => setEmbeddedLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInsertLink();
                    } else if (e.key === 'Escape') {
                      setShowLinkEditor(false);
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Text (optional)</label>
                <input
                  type="text"
                  value={embeddedLinkText}
                  onChange={(e) => setEmbeddedLinkText(e.target.value)}
                  placeholder="Enter link text..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleInsertLink();
                    } else if (e.key === 'Escape') {
                      setShowLinkEditor(false);
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLinkEditor(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!embeddedLinkUrl.trim()}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  embeddedLinkUrl.trim()
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                }`}
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

            // Keyboard shortcuts
            if (e.ctrlKey || e.metaKey) {
              switch (e.key.toLowerCase()) {
                case 'b':
                  e.preventDefault();
                  formatText('bold');
                  break;
                case 'i':
                  e.preventDefault();
                  formatText('italic');
                  break;
                case 'u':
                  e.preventDefault();
                  formatText('underline');
                  break;
                case 'k':
                  e.preventDefault();
                  insertLink();
                  break;
                case 'e':
                  e.preventDefault();
                  formatText('inlineCode');
                  break;
                case 'z':
                  e.preventDefault();
                  if (e.shiftKey) {
                    handleRedo();
                  } else {
                    handleUndo();
                  }
                  break;
              }
            }
          }}
          className={`min-h-64 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 rich-text-editor ${!showPlaceholder ? 'no-placeholder' : ''}`}
          style={{ minHeight: '200px' }}
          data-placeholder={isEditing ? placeholder : "Click edit button to create your paragraph"}
        />

        {/* Stats and Status */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-4">
            <span>Words: {getWordCount(content)}</span>
            <span>Characters: {getCharacterCount(content)}</span>
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
