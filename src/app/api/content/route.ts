import { NextRequest, NextResponse } from 'next/server';
import { getAllContent, prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type');
    const limit = searchParams.get('limit');
    const exclude = searchParams.get('exclude');

    // If no specific parameters, return all content
    if (!contentType && !limit && !exclude) {
      const content = await getAllContent();
      return NextResponse.json(content, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    // Build filtered query
    const where: Record<string, unknown> = {};

    if (contentType) {
      where.contentType = contentType;
    }

    if (exclude) {
      where.id = {
        not: exclude
      };
    }

    const content = await prisma.content.findMany({
      where,
      orderBy: {
        publishedDate: 'desc'
      },
      take: limit ? parseInt(limit) : undefined,
      include: {
        contentBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json({ content }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Description is optional, but if provided, it must be a valid string
    if (body.description !== undefined && body.description !== null && (typeof body.description !== 'string' || body.description.trim() === '')) {
      return NextResponse.json(
        { error: 'Description must be a valid string if provided.' },
        { status: 400 }
      );
    }

    if (!body.contentType || typeof body.contentType !== 'string' || body.contentType.trim() === '') {
      return NextResponse.json(
        { error: 'Content type is required and must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = body.slug || body.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug is unique
    const existingSlug = await prisma.content.findFirst({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'A content item with this slug already exists. Please choose a different title or provide a unique slug.' },
        { status: 409 }
      );
    }

    const newContent = await prisma.content.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        contentType: body.contentType.trim(),
        category: body.category?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        contentUrl: body.contentUrl?.trim() || null,
        tags: Array.isArray(body.tags) ? body.tags.filter((tag: unknown) => tag && typeof tag === 'string') : [],
        featured: Boolean(body.featured),
        author: body.author?.trim() || 'Sid',
        status: body.status || 'DRAFT',
        slug: slug,
        // Create initial content blocks if provided
        contentBlocks: body.contentBlocks ? {
          create: body.contentBlocks.map((block: { blockType: string; data: unknown }, index: number) => ({
            blockType: block.blockType,
            order: index,
            data: block.data
          }))
        } : undefined
      },
      include: {
        contentBlocks: true
      }
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2002':
          return NextResponse.json(
            { error: 'A content item with this slug already exists. Please choose a different title or slug.' },
            { status: 409 }
          );
        default:
          return NextResponse.json(
            { error: 'Database error occurred while creating content.' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
