import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Content type definitions

export interface Content {
  id: string;
  title: string;
  description?: string | null;
  contentType: 'project' | 'case_study' | 'blog';
  category?: string | null;
  featured?: boolean;
  featuredOrder?: number | null;
  posterImage?: string | null;
  imageUrl?: string | null;
  contentUrl?: string | null;
  publishedDate: Date;
  author: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Content fetching functions

export async function getCurrentFeaturedContent(): Promise<Content | null> {
  try {
    const featured = await prisma.content.findFirst({
      where: { featured: true },
      orderBy: { updatedAt: 'desc' }
    });

    return featured as Content | null;
  } catch (error) {
    console.error('Error fetching current featured content:', error);
    return null;
  }
}

export async function replaceFeaturedContent(oldId: string, newId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // Unfeatured the old content
      await tx.content.update({
        where: { id: oldId },
        data: { featured: false }
      });

      // Feature the new content
      await tx.content.update({
        where: { id: newId },
        data: { featured: true }
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error replacing featured content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to replace featured content'
    };
  }
}

export async function unfeaturedContent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.content.update({
      where: { id },
      data: { featured: false }
    });

    return { success: true };
  } catch (error) {
    console.error('Error unfeaturing content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unfeature content'
    };
  }
}

export async function getAllContent(): Promise<Content[]> {
  try {
    const content = await prisma.content.findMany({
      orderBy: { publishedDate: 'desc' },
      include: {
        contentBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return content as Content[];
  } catch (error) {
    console.error('Error fetching all content:', error);
    return [];
  }
}

export async function getContentById(id: string): Promise<Content | null> {
  try {
    const content = await prisma.content.findUnique({
      where: { id },
    });
    
    return content as Content | null;
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    return null;
  }
}

export async function searchContent(query: string): Promise<Content[]> {
  try {
    const content = await prisma.content.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } },
        ],
      },
      orderBy: { publishedDate: 'desc' },
    });
    
    return content as Content[];
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
}

export async function getFeaturedContent(page: number = 1, limit: number = 5): Promise<{
  content: Content[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}> {
  try {
    const skip = (page - 1) * limit;

    // Get total count of featured content
    const totalCount = await prisma.content.count({
      where: { featured: true },
    });

    // Try to use featuredOrder if it exists, otherwise fall back to publishedDate
    let content: Content[] = [];

    try {
      // Fetch posts with explicit order first, then posts without order
      // This ensures NULLs come last
      const orderedContent = await prisma.content.findMany({
        where: {
          featured: true,
          featuredOrder: { not: null }
        },
        orderBy: { featuredOrder: 'asc' },
        include: {
          contentBlocks: {
            orderBy: { order: 'asc' }
          }
        }
      });

      const unorderedContent = await prisma.content.findMany({
        where: {
          featured: true,
          featuredOrder: null
        },
        orderBy: { publishedDate: 'desc' },
        include: {
          contentBlocks: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // Combine: ordered posts first, then unordered posts
      const allContent = [...orderedContent, ...unorderedContent];

      // Apply pagination
      content = allContent.slice(skip, skip + limit) as Content[];
    } catch (columnError) {
      // If featuredOrder column doesn't exist yet, fall back to simple query
      console.warn('featuredOrder column not found, using publishedDate ordering:', columnError);
      content = await prisma.content.findMany({
        where: { featured: true },
        orderBy: { publishedDate: 'desc' },
        skip,
        take: limit,
        include: {
          contentBlocks: {
            orderBy: { order: 'asc' }
          }
        }
      }) as Content[];
    }

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      content,
      totalCount,
      totalPages,
      currentPage: page,
      hasNext,
      hasPrevious,
    };
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return {
      content: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      hasNext: false,
      hasPrevious: false,
    };
  }
}

export async function updateFeaturedOrder(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      // Update featuredOrder for each content item
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.content.update({
          where: { id: orderedIds[i] },
          data: { featuredOrder: i + 1 } // 1-indexed order
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating featured order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update featured order'
    };
  }
}
