import { PrismaClient, BlockType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTemplateOptions {
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  contentType: string;
  isPublic?: boolean;
  createdBy: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultAuthor?: string;
  defaultTags: string[];
  defaultCategory?: string;
  defaultFeatured?: boolean;
  templateBlocks: TemplateBlockData[];
}

export interface TemplateBlockData {
  blockType: BlockType;
  order: number;
  data: unknown;
  isRequired?: boolean;
}

export interface CreateSnippetOptions {
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  blockType: BlockType;
  isPublic?: boolean;
  createdBy: string;
  data: unknown;
}

export interface TemplateSearchFilters {
  category?: string;
  contentType?: string;
  isPublic?: boolean;
  createdBy?: string;
  tags?: string[];
  query?: string;
}

export interface SnippetSearchFilters {
  category?: string;
  blockType?: BlockType;
  isPublic?: boolean;
  createdBy?: string;
  tags?: string[];
  query?: string;
}

export class TemplateService {
  /**
   * Create a new content template
   */
  static async createTemplate(options: CreateTemplateOptions) {
    const template = await prisma.contentTemplate.create({
      data: {
        name: options.name,
        description: options.description,
        category: options.category,
        tags: options.tags,
        contentType: options.contentType,
        isPublic: options.isPublic || false,
        createdBy: options.createdBy,
        defaultTitle: options.defaultTitle,
        defaultDescription: options.defaultDescription,
        defaultAuthor: options.defaultAuthor,
        defaultTags: options.defaultTags,
        defaultCategory: options.defaultCategory,
        defaultFeatured: options.defaultFeatured || false,
        templateBlocks: {
          create: options.templateBlocks.map(block => ({
            blockType: block.blockType,
            order: block.order,
            data: (block.data === null
              ? Prisma.JsonNull
              : (block.data as Prisma.InputJsonValue)),
            isRequired: block.isRequired || false
          }))
        }
      },
      include: {
        templateBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return template;
  }

  /**
   * Get all templates with optional filtering
   */
  static async getTemplates(filters: TemplateSearchFilters = {}) {
    const where: Record<string, unknown> = {};

    if (filters.category) where.category = filters.category;
    if (filters.contentType) where.contentType = filters.contentType;
    if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters.createdBy) where.createdBy = filters.createdBy;
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasEvery: filters.tags };
    }
    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } }
      ];
    }

    return await prisma.contentTemplate.findMany({
      where,
      include: {
        templateBlocks: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Get a specific template by ID
   */
  static async getTemplate(id: string) {
    return await prisma.contentTemplate.findUnique({
      where: { id },
      include: {
        templateBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  /**
   * Update a template
   */
  static async updateTemplate(id: string, updates: Partial<CreateTemplateOptions>) {
    const { templateBlocks, ...templateData } = updates;

    const result = await prisma.$transaction(async (tx) => {
      // Update template metadata
      const template = await tx.contentTemplate.update({
        where: { id },
        data: {
          ...templateData,
          tags: templateData.tags,
          defaultTags: templateData.defaultTags
        }
      });

      // If template blocks are provided, replace them
      if (templateBlocks) {
        // Delete existing blocks
        await tx.templateBlock.deleteMany({
          where: { templateId: id }
        });

        // Create new blocks
        await tx.templateBlock.createMany({
          data: templateBlocks.map(block => ({
            templateId: id,
            blockType: block.blockType,
            order: block.order,
            data: (block.data === null
              ? Prisma.JsonNull
              : (block.data as Prisma.InputJsonValue)),
            isRequired: block.isRequired || false
          }))
        });
      }

      return template;
    });

    return result;
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(id: string) {
    return await prisma.contentTemplate.delete({
      where: { id }
    });
  }

  /**
   * Apply a template (increment usage count and return template data)
   */
  static async applyTemplate(id: string) {
    const template = await prisma.contentTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
      include: {
        templateBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return template;
  }

  /**
   * Create a content snippet
   */
  static async createSnippet(options: CreateSnippetOptions) {
    return await prisma.contentSnippet.create({
      data: {
        name: options.name,
        description: options.description,
        category: options.category,
        tags: options.tags,
        blockType: options.blockType,
        isPublic: options.isPublic || false,
        createdBy: options.createdBy,
        data: (options.data === null
          ? Prisma.JsonNull
          : (options.data as Prisma.InputJsonValue))
      }
    });
  }

  /**
   * Get all snippets with optional filtering
   */
  static async getSnippets(filters: SnippetSearchFilters = {}) {
    const where: Record<string, unknown> = {};

    if (filters.category) where.category = filters.category;
    if (filters.blockType) where.blockType = filters.blockType;
    if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters.createdBy) where.createdBy = filters.createdBy;
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasEvery: filters.tags };
    }
    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } }
      ];
    }

    return await prisma.contentSnippet.findMany({
      where,
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Get a specific snippet by ID
   */
  static async getSnippet(id: string) {
    return await prisma.contentSnippet.findUnique({
      where: { id }
    });
  }

  /**
   * Update a snippet
   */
  static async updateSnippet(id: string, updates: Partial<CreateSnippetOptions>) {
    return await prisma.contentSnippet.update({
      where: { id },
      data: {
        ...updates,
        tags: updates.tags,
        data: (updates.data === null
          ? Prisma.JsonNull
          : (updates.data as Prisma.InputJsonValue))
      }
    });
  }

  /**
   * Delete a snippet
   */
  static async deleteSnippet(id: string) {
    return await prisma.contentSnippet.delete({
      where: { id }
    });
  }

  /**
   * Apply a snippet (increment usage count and return snippet data)
   */
  static async applySnippet(id: string) {
    return await prisma.contentSnippet.update({
      where: { id },
      data: { usageCount: { increment: 1 } }
    });
  }

  /**
   * Get template and snippet statistics
   */
  static async getStats() {
    const [templateStats, snippetStats] = await Promise.all([
      prisma.contentTemplate.aggregate({
        _count: { id: true },
        _sum: { usageCount: true }
      }),
      prisma.contentSnippet.aggregate({
        _count: { id: true },
        _sum: { usageCount: true }
      })
    ]);

    const [popularTemplates, popularSnippets] = await Promise.all([
      prisma.contentTemplate.findMany({
        take: 5,
        orderBy: { usageCount: 'desc' },
        select: { id: true, name: true, usageCount: true }
      }),
      prisma.contentSnippet.findMany({
        take: 5,
        orderBy: { usageCount: 'desc' },
        select: { id: true, name: true, usageCount: true }
      })
    ]);

    return {
      templates: {
        total: templateStats._count.id || 0,
        totalUsage: templateStats._sum.usageCount || 0,
        popular: popularTemplates
      },
      snippets: {
        total: snippetStats._count.id || 0,
        totalUsage: snippetStats._sum.usageCount || 0,
        popular: popularSnippets
      }
    };
  }

  /**
   * Get available template categories and content types
   */
  static async getTemplateOptions() {
    const templates = await prisma.contentTemplate.findMany({
      select: { category: true, contentType: true, tags: true }
    });

    const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
    const contentTypes = [...new Set(templates.map(t => t.contentType))];
    const tags = [...new Set(templates.flatMap(t => t.tags))];

    return { categories, contentTypes, tags };
  }

  /**
   * Get available snippet categories and block types
   */
  static async getSnippetOptions() {
    const snippets = await prisma.contentSnippet.findMany({
      select: { category: true, blockType: true, tags: true }
    });

    const categories = [...new Set(snippets.map(s => s.category).filter(Boolean))];
    const blockTypes = [...new Set(snippets.map(s => s.blockType))];
    const tags = [...new Set(snippets.flatMap(s => s.tags))];

    return { categories, blockTypes, tags };
  }
}