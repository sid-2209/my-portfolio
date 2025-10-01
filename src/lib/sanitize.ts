import DOMPurify from 'dompurify';

// Configure DOMPurify with safe settings for content creation
const configureDOMPurify = () => {
  // Allow common safe HTML elements and attributes
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'cite',
    'a', 'img',
    'div', 'span',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'code', 'pre',
    'hr'
  ];

  const allowedAttributes = [
    'href', 'target', 'rel',
    'src', 'alt', 'title', 'width', 'height',
    'class', 'id', 'style',
    'colspan', 'rowspan'
  ];

  const allowedStyles = [
    'color', 'background-color',
    'font-size', 'font-weight', 'font-style',
    'text-align', 'text-decoration',
    'margin', 'padding',
    'border', 'border-radius',
    'width', 'height', 'max-width', 'max-height'
  ];

  return {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOWED_CSS: allowedStyles,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    SAFE_FOR_TEMPLATES: true,
    WHOLE_DOCUMENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    FORCE_BODY: false,
    SANITIZE_NAMED_PROPS: true
  };
};

// Sanitize HTML content for rich text editors (paragraphs, headings)
export const sanitizeRichText = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: return as-is, sanitization will happen on client
    return html;
  }

  const config = configureDOMPurify();

  // More restrictive for rich text - no custom HTML elements
  const restrictedConfig = {
    ...config,
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
      'ul', 'ol', 'li',
      'a', 'code'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  };

  return DOMPurify.sanitize(html, restrictedConfig);
};

// Sanitize HTML for quote blocks
export const sanitizeQuoteText = (html: string): string => {
  if (typeof window === 'undefined') {
    return html;
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['em', 'strong', 'br'],
    ALLOWED_ATTR: [],
    SANITIZE_DOM: true
  });
};

// Sanitize custom HTML with more permissive settings but still secure
export const sanitizeCustomHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    return html;
  }

  const config = configureDOMPurify();

  // Add some additional safe elements for custom HTML
  const customConfig = {
    ...config,
    ALLOWED_TAGS: [
      ...config.ALLOWED_TAGS,
      'section', 'article', 'aside', 'header', 'footer', 'nav',
      'figure', 'figcaption',
      'button', 'form', 'input', 'label', 'textarea', 'select', 'option'
    ],
    ALLOWED_ATTR: [
      ...config.ALLOWED_ATTR,
      'type', 'name', 'value', 'placeholder', 'required', 'disabled',
      'aria-label', 'aria-describedby', 'role'
    ]
  };

  return DOMPurify.sanitize(html, customConfig);
};

// Validate HTML structure and detect potentially dangerous elements
export const validateHTML = (html: string): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  if (!html.trim()) {
    return { isValid: true, warnings: [] };
  }

  try {
    if (typeof window === 'undefined') {
      return { isValid: true, warnings: ['Validation skipped on server-side'] };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      warnings.push('Invalid HTML structure detected');
    }

    // Check for potentially dangerous elements
    const dangerousElements = ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'style'];
    const hasDangerousElements = dangerousElements.some(tag =>
      doc.querySelector(tag) !== null
    );

    if (hasDangerousElements) {
      warnings.push('Potentially unsafe HTML elements detected (script, iframe, etc.)');
    }

    // Check for inline event handlers
    const allElements = doc.querySelectorAll('*');
    let hasInlineEvents = false;
    allElements.forEach(element => {
      const attributes = element.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith('on')) {
          hasInlineEvents = true;
          break;
        }
      }
    });

    if (hasInlineEvents) {
      warnings.push('Inline event handlers detected (onclick, onload, etc.)');
    }

    // Check for data URIs in src attributes
    const elementsWithSrc = doc.querySelectorAll('[src]');
    let hasDataURI = false;
    elementsWithSrc.forEach(element => {
      const src = element.getAttribute('src');
      if (src && src.startsWith('data:')) {
        hasDataURI = true;
      }
    });

    if (hasDataURI) {
      warnings.push('Data URIs detected in src attributes');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  } catch {
    warnings.push('HTML parsing error');
    return { isValid: false, warnings };
  }
};

// Strip all HTML tags and return plain text
export const stripHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    // Simple server-side HTML stripping
    return html.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Sanitize and validate together for comprehensive security
export const sanitizeAndValidate = (
  html: string,
  type: 'rich' | 'quote' | 'custom' = 'rich'
): {
  sanitized: string;
  validation: { isValid: boolean; warnings: string[] };
} => {
  let sanitized: string;

  switch (type) {
    case 'quote':
      sanitized = sanitizeQuoteText(html);
      break;
    case 'custom':
      sanitized = sanitizeCustomHTML(html);
      break;
    default:
      sanitized = sanitizeRichText(html);
  }

  const validation = validateHTML(sanitized);

  return {
    sanitized,
    validation
  };
};