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
      },
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
