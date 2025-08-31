import { NextResponse } from 'next/server';
import { getContentByType, ContentType } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const contentType = params.type as ContentType;
    
    // Validate content type
    if (!['project', 'case_study', 'blog'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }
    
    const content = await getContentByType(contentType);
    
    return NextResponse.json(content, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in content type API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
