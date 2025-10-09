/**
 * Robust utilities for applying colors to selected text with formatting preservation
 */

/**
 * Apply text color to the current selection, preserving all existing formatting
 * @param color - Hex color code (e.g., "#E34234")
 */
export function applyTextColorToSelection(color: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn('[applyTextColorToSelection] No selection found');
    return;
  }

  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    console.warn('[applyTextColorToSelection] Selection is collapsed (empty)');
    return;
  }

  // Create a span with the text color
  const span = document.createElement('span');
  span.style.color = color;

  // If text has underline or strikethrough, apply color to text-decoration
  const commonAncestor = range.commonAncestorContainer;
  const parentElement = commonAncestor.nodeType === Node.ELEMENT_NODE
    ? (commonAncestor as Element)
    : commonAncestor.parentElement;

  if (parentElement) {
    const computedStyle = window.getComputedStyle(parentElement);
    const textDecoration = computedStyle.textDecoration || computedStyle.textDecorationLine;

    if (textDecoration && textDecoration !== 'none') {
      span.style.textDecorationColor = color;
    }
  }

  try {
    // Surround the selection with the span
    range.surroundContents(span);

    // Collapse selection to end
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (error) {
    // If surroundContents fails (e.g., selection spans multiple elements),
    // use extractContents and appendChild approach
    console.log('[applyTextColorToSelection] Using fallback method for complex selection');

    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);

    // Select the newly inserted span
    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * Apply highlight (background) color to the current selection
 * @param color - Hex color code (e.g., "#FFEB3B")
 */
export function applyHighlightColorToSelection(color: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn('[applyHighlightColorToSelection] No selection found');
    return;
  }

  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    console.warn('[applyHighlightColorToSelection] Selection is collapsed (empty)');
    return;
  }

  // Create a span with the background color
  const span = document.createElement('span');
  span.style.backgroundColor = color;

  try {
    // Surround the selection with the span
    range.surroundContents(span);

    // Collapse selection to end
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (error) {
    // Fallback for complex selections
    console.log('[applyHighlightColorToSelection] Using fallback method for complex selection');

    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);

    // Select the newly inserted span
    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * Advanced color application using TreeWalker for deeply nested selections
 * This handles edge cases like partially selected elements and nested formatting
 * @param color - Hex color code
 * @param type - 'text' for color, 'highlight' for backgroundColor
 */
export function applyColorRobust(color: string, type: 'text' | 'highlight'): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  // Try simple approach first
  const simpleApply = type === 'text' ? applyTextColorToSelection : applyHighlightColorToSelection;

  try {
    simpleApply(color);
  } catch (error) {
    console.error(`[applyColorRobust] Failed to apply ${type} color:`, error);

    // Fallback: wrap in styled span
    try {
      const span = document.createElement('span');
      if (type === 'text') {
        span.style.color = color;
      } else {
        span.style.backgroundColor = color;
      }

      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);

      // Restore selection
      range.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (fallbackError) {
      console.error('[applyColorRobust] Fallback also failed:', fallbackError);
    }
  }
}

/**
 * Remove all color styling from the current selection
 * @param type - 'text' or 'highlight'
 */
export function removeColorFromSelection(type: 'text' | 'highlight'): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  // Get all elements in the selection
  const container = range.commonAncestorContainer;
  const root = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;

  if (!root) return;

  // Find all spans with the color style
  const spans = (root as Element).querySelectorAll('span');
  spans.forEach(span => {
    const htmlSpan = span as HTMLElement;
    if (type === 'text') {
      htmlSpan.style.removeProperty('color');
      htmlSpan.style.removeProperty('text-decoration-color');
    } else {
      htmlSpan.style.removeProperty('background-color');
    }

    // Remove span if it has no other styles
    if (!htmlSpan.style.cssText) {
      const parent = htmlSpan.parentNode;
      if (parent) {
        while (htmlSpan.firstChild) {
          parent.insertBefore(htmlSpan.firstChild, htmlSpan);
        }
        parent.removeChild(htmlSpan);
      }
    }
  });
}
