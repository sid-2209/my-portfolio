import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET() {
  try {
    // First try to get featured content
    let featuredContent = await prisma.content.findFirst({
      where: { featured: true },
      orderBy: { publishedDate: 'desc' },
    });

    // If no featured content, get the most recent content
    if (!featuredContent) {
      featuredContent = await prisma.content.findFirst({
        orderBy: { publishedDate: 'desc' },
      });
    }

    if (!featuredContent) {
      return NextResponse.json(
        { error: 'No content available' },
        { status: 404 }
      );
    }

    return NextResponse.json(featuredContent, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in featured content API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured content' },
      { status: 500 }
    );
  }
}
