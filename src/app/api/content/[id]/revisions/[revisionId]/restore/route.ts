import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const { id, revisionId } = await params;

    // Get the revision to restore with its block revisions
    const revision = await prisma.contentRevision.findUnique({
      where: {
        id: revisionId,
        contentId: id
      },
      include: {
        blockRevisions: true
      }
    });

    if (!revision) {
      return NextResponse.json(
        { error: 'Revision not found' },
        { status: 404 }
      );
    }

    // Get the current content for backup
    const currentContent = await prisma.content.findUnique({
      where: { id },
      include: { contentBlocks: true }
    });

    if (!currentContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Get the next revision number for backup
    const lastRevision = await prisma.contentRevision.findFirst({
      where: { contentId: id },
      orderBy: { revisionNumber: 'desc' }
    });

    const nextRevisionNumber = (lastRevision?.revisionNumber || 0) + 1;

    // Create a backup revision of current state
    await prisma.contentRevision.create({
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
        changesSummary: `Backup before restoring revision ${revisionId}`,
        changeType: 'EDIT',
        createdBy: currentContent.author
      }
    });

    // Update content with revision data
    await prisma.content.update({
      where: { id },
      data: {
        title: revision.title,
        description: revision.description,
        contentType: revision.contentType,
        posterImage: revision.posterImage,
        contentUrl: revision.contentUrl,
        author: revision.author,
        tags: revision.tags,
        category: revision.category,
        featured: revision.featured,
        imageUrl: revision.imageUrl,
        status: revision.status,
        slug: revision.slug,
        updatedAt: new Date()
      }
    });

    // Delete existing content blocks
    await prisma.contentBlock.deleteMany({
      where: { contentId: id }
    });

    // Restore content blocks from revision's block revisions
    if (revision.blockRevisions && revision.blockRevisions.length > 0) {
      for (const blockRevision of revision.blockRevisions) {
        await prisma.contentBlock.create({
          data: {
            contentId: id,
            blockType: blockRevision.blockType,
            data: blockRevision.data as Record<string, unknown>,
            order: blockRevision.order
          }
        });
      }
    }

    // Get the next revision number for restore record
    const lastRevisionAfterBackup = await prisma.contentRevision.findFirst({
      where: { contentId: id },
      orderBy: { revisionNumber: 'desc' }
    });

    const restoreRevisionNumber = (lastRevisionAfterBackup?.revisionNumber || 0) + 1;

    // Create a restore revision
    await prisma.contentRevision.create({
      data: {
        contentId: id,
        revisionNumber: restoreRevisionNumber,
        title: revision.title,
        description: revision.description,
        contentType: revision.contentType,
        posterImage: revision.posterImage,
        contentUrl: revision.contentUrl,
        author: revision.author,
        tags: revision.tags,
        category: revision.category,
        featured: revision.featured,
        imageUrl: revision.imageUrl,
        status: revision.status,
        slug: revision.slug,
        changesSummary: `Restored from revision #${revision.revisionNumber} created at ${revision.createdAt.toISOString()}`,
        changeType: 'RESTORE',
        createdBy: revision.createdBy
      }
    });

    // Get the updated content
    const updatedContent = await prisma.content.findUnique({
      where: { id },
      include: { contentBlocks: { orderBy: { order: 'asc' } } }
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error restoring revision:', error);
    return NextResponse.json(
      { error: 'Failed to restore revision' },
      { status: 500 }
    );
  }
}
