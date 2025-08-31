import { NextResponse } from 'next/server';
import { getAllContent } from '@/lib/db';

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
