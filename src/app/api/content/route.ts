import { NextRequest, NextResponse } from 'next/server';
import { getAllContent, prisma } from '../../../lib/db';

export async function GET() {
  try {
    const content = await getAllContent();
    
    return NextResponse.json(content, {
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
    
    // Generate slug from title if not provided
    const slug = body.slug || body.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const newContent = await prisma.content.create({
      data: {
        title: body.title,
        description: body.description,
        contentType: body.contentType,
        category: body.category,
        imageUrl: body.imageUrl,
        contentUrl: body.contentUrl,
        tags: body.tags,
        featured: body.featured || false,
        author: body.author || 'Sid',
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
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}
