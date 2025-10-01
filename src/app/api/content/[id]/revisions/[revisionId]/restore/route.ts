import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const { id, revisionId } = await params;

    // Get the revision to restore
    const revision = await prisma.contentRevision.findUnique({
      where: {
        id: revisionId,
        contentId: id
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

    // Create a backup revision of current state
    await prisma.contentRevision.create({
      data: {
        contentId: id,
        title: currentContent.title,
        description: currentContent.description,
        contentBlocks: currentContent.contentBlocks,
        metadata: {},
        changeType: 'restore_backup',
        changeDescription: `Backup before restoring revision ${revisionId}`
      }
    });

    // Update content with revision data
    await prisma.content.update({
      where: { id },
      data: {
        title: revision.title,
        description: revision.description,
        updatedAt: new Date()
      }
    });

    // Delete existing content blocks
    await prisma.contentBlock.deleteMany({
      where: { contentId: id }
    });

    // Restore content blocks from revision
    if (revision.contentBlocks && Array.isArray(revision.contentBlocks)) {
      const blocks = revision.contentBlocks as Array<{
        blockType: string;
        data: unknown;
        order: number;
      }>;

      for (const block of blocks) {
        await prisma.contentBlock.create({
          data: {
            contentId: id,
            blockType: block.blockType as 'text' | 'image' | 'video' | 'quote' | 'list' | 'divider' | 'custom_html',
            data: block.data,
            order: block.order
          }
        });
      }
    }

    // Create a restore revision
    await prisma.contentRevision.create({
      data: {
        contentId: id,
        title: revision.title,
        description: revision.description,
        contentBlocks: revision.contentBlocks,
        metadata: revision.metadata,
        changeType: 'restore',
        changeDescription: `Restored from revision created at ${revision.createdAt.toISOString()}`
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
