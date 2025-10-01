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

export async function getFeaturedContent(page: number = 1, limit: number = 4): Promise<{
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
    
    // Get featured content with pagination
    const content = await prisma.content.findMany({
      where: { featured: true },
      orderBy: { publishedDate: 'desc' },
      skip,
      take: limit,
    });
    
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;
    
    return {
      content: content as Content[],
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
