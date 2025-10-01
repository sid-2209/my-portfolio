import { z } from 'zod';

// HTML sanitization function
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and potentially dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
}

// Text sanitization function
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, '') // Remove control characters
    .replace(/\u2028|\u2029/g, ' '); // Replace line/paragraph separators
}

// URL validation and sanitization
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  // Allow empty URLs
  if (!trimmed) return '';

  // Ensure URL starts with http/https or is a relative path
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // Default to https for domain-only URLs
  return `https://${trimmed}`;
}

// Content validation schemas
export const ContentValidationSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeText),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),

  contentType: z.enum(['blog', 'project', 'case_study', 'tutorial', 'news'])
    .refine(val => val, 'Content type is required'),

  category: z.string()
    .max(100, 'Category must be less than 100 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),

  author: z.string()
    .min(1, 'Author is required')
    .max(100, 'Author must be less than 100 characters')
    .transform(sanitizeText),

  tags: z.array(z.string()
    .max(50, 'Each tag must be less than 50 characters')
    .transform(sanitizeText))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),

  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),

  featured: z.boolean().default(false),

  imageUrl: z.string()
    .url('Image URL must be a valid URL')
    .optional()
    .or(z.literal(''))
    .transform(val => val ? sanitizeUrl(val) : undefined),

  contentUrl: z.string()
    .url('Content URL must be a valid URL')
    .optional()
    .or(z.literal(''))
    .transform(val => val ? sanitizeUrl(val) : undefined),

  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .max(100, 'Slug must be less than 100 characters')
    .optional()
    .transform(val => val ? val.toLowerCase() : undefined),

  version: z.number()
    .int('Version must be an integer')
    .min(1, 'Version must be at least 1')
    .optional()
});

// Content block validation schemas
export const ParagraphBlockSchema = z.object({
  blockType: z.literal('PARAGRAPH'),
  data: z.object({
    text: z.string()
      .max(10000, 'Paragraph text must be less than 10,000 characters')
      .transform(sanitizeHtml)
  })
});

export const HeadingBlockSchema = z.object({
  blockType: z.literal('HEADING'),
  data: z.object({
    text: z.string()
      .max(200, 'Heading text must be less than 200 characters')
      .transform(sanitizeText),
    level: z.number().int().min(1).max(6).default(2)
  })
});

export const ImageBlockSchema = z.object({
  blockType: z.literal('IMAGE'),
  data: z.object({
    src: z.string().url('Image source must be a valid URL').transform(sanitizeUrl),
    alt: z.string()
      .max(200, 'Alt text must be less than 200 characters')
      .transform(sanitizeText),
    caption: z.string()
      .max(500, 'Caption must be less than 500 characters')
      .optional()
      .transform(val => val ? sanitizeText(val) : undefined)
  })
});

export const CodeBlockSchema = z.object({
  blockType: z.literal('CODE_BLOCK'),
  data: z.object({
    code: z.string()
      .max(50000, 'Code must be less than 50,000 characters'),
    language: z.string()
      .max(50, 'Language must be less than 50 characters')
      .transform(sanitizeText)
      .default('text')
  })
});

export const QuoteBlockSchema = z.object({
  blockType: z.literal('QUOTE'),
  data: z.object({
    text: z.string()
      .max(1000, 'Quote text must be less than 1,000 characters')
      .transform(sanitizeText),
    author: z.string()
      .max(100, 'Author must be less than 100 characters')
      .optional()
      .transform(val => val ? sanitizeText(val) : undefined),
    source: z.string()
      .max(200, 'Source must be less than 200 characters')
      .optional()
      .transform(val => val ? sanitizeText(val) : undefined)
  })
});

export const ListBlockSchema = z.object({
  blockType: z.literal('LIST'),
  data: z.object({
    type: z.enum(['ordered', 'unordered']).default('unordered'),
    items: z.array(z.string()
      .max(500, 'Each list item must be less than 500 characters')
      .transform(sanitizeText))
      .max(50, 'Maximum 50 list items allowed')
  })
});

export const DividerBlockSchema = z.object({
  blockType: z.literal('DIVIDER'),
  data: z.object({
    style: z.enum(['solid', 'dashed', 'dotted', 'double']).default('solid'),
    color: z.string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
      .default('#000000')
  })
});

export const CustomBlockSchema = z.object({
  blockType: z.literal('CUSTOM'),
  data: z.object({
    html: z.string()
      .max(100000, 'Custom HTML must be less than 100,000 characters')
      .transform(sanitizeHtml)
  })
});

// Union schema for all block types
export const ContentBlockSchema = z.discriminatedUnion('blockType', [
  ParagraphBlockSchema,
  HeadingBlockSchema,
  ImageBlockSchema,
  CodeBlockSchema,
  QuoteBlockSchema,
  ListBlockSchema,
  DividerBlockSchema,
  CustomBlockSchema
]);

// Content blocks array validation
export const ContentBlocksArraySchema = z.array(ContentBlockSchema)
  .max(100, 'Maximum 100 content blocks allowed');

// Media validation schema
export const MediaValidationSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename must be less than 255 characters')
    .transform(sanitizeText),

  originalName: z.string()
    .min(1, 'Original name is required')
    .max(255, 'Original name must be less than 255 characters')
    .transform(sanitizeText),

  mimetype: z.string()
    .regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, 'Invalid MIME type')
    .transform(val => val.toLowerCase()),

  size: z.number()
    .int('Size must be an integer')
    .min(1, 'Size must be greater than 0')
    .max(100 * 1024 * 1024, 'File size must be less than 100MB'),

  altText: z.string()
    .max(200, 'Alt text must be less than 200 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),

  caption: z.string()
    .max(500, 'Caption must be less than 500 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),

  folder: z.string()
    .max(100, 'Folder name must be less than 100 characters')
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),

  source: z.string()
    .max(100, 'Source must be less than 100 characters')
    .transform(sanitizeText)
});

// Validation helper functions
export function validateContent(data: unknown) {
  return ContentValidationSchema.safeParse(data);
}

export function validateContentBlocks(data: unknown) {
  return ContentBlocksArraySchema.safeParse(data);
}

export function validateMedia(data: unknown) {
  return MediaValidationSchema.safeParse(data);
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart);

    // Check if under limit
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter();