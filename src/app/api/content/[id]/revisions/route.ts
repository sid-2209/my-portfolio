import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch revisions for the content with block revisions included
    const revisions = await prisma.contentRevision.findMany({
      where: {
        contentId: id
      },
      include: {
        blockRevisions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revisions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Get current content to snapshot
    const currentContent = await prisma.content.findUnique({
      where: { id },
      include: {
        contentBlocks: true
      }
    });

    if (!currentContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Get the next revision number
    const lastRevision = await prisma.contentRevision.findFirst({
      where: { contentId: id },
      orderBy: { revisionNumber: 'desc' }
    });

    const nextRevisionNumber = (lastRevision?.revisionNumber || 0) + 1;

    // Create a new revision with full content snapshot
    const revision = await prisma.contentRevision.create({
      data: {
        contentId: id,
        revisionNumber: nextRevisionNumber,
        title: currentContent.title,
        description: currentContent.description,
        contentType: currentContent.contentType,
        posterImage: currentContent.posterImage,
        contentUrl: currentContent.contentUrl,
        author: currentContent.author,
        tags: currentContent.tags,
        category: currentContent.category,
        featured: currentContent.featured,
        imageUrl: currentContent.imageUrl,
        status: currentContent.status,
        slug: currentContent.slug,
        changesSummary: body.changesSummary,
        changeType: body.changeType || 'EDIT',
        createdBy: body.createdBy || currentContent.author
      }
    });

    return NextResponse.json(revision);
  } catch (error) {
    console.error('Error creating revision:', error);
    return NextResponse.json(
      { error: 'Failed to create revision' },
      { status: 500 }
    );
  }
}
