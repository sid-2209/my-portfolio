import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Content type definitions
export type ContentType = 'project' | 'case_study' | 'blog';

export interface Content {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  posterImage?: string | null;
  contentUrl?: string | null;
  publishedDate: Date;
  author: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Content fetching functions
export async function getContentByType(type: ContentType): Promise<Content[]> {
  try {
    const content = await prisma.content.findMany({
      where: { contentType: type },
      orderBy: { publishedDate: 'desc' },
    });
    
    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    return [];
  }
}

export async function getAllContent(): Promise<Content[]> {
  try {
    const content = await prisma.content.findMany({
      orderBy: { publishedDate: 'desc' },
    });
    
    return content;
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
    
    return content;
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
    
    return content;
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
}
