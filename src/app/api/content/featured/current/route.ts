import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';

export async function GET() {
  try {
    const currentFeatured = await prisma.content.findFirst({
      where: { featured: true },
      orderBy: { updatedAt: 'desc' }, // Get most recently updated featured content
      select: {
        id: true,
        title: true,
        description: true,
        contentType: true,
        imageUrl: true,
        publishedDate: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      featured: currentFeatured,
      hasFeatured: !!currentFeatured
    });
  } catch (error) {
    console.error('Error fetching current featured content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current featured content' },
      { status: 500 }
    );
  }
}