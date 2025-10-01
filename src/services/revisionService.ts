import { PrismaClient, RevisionType, BlockChangeType } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateRevisionOptions {
  contentId: string;
  changesSummary?: string;
  changeType: RevisionType;
  createdBy: string;
}

export interface ContentSnapshot {
  title: string;
  description?: string | null;
  contentType: string;
  posterImage?: string | null;
  contentUrl?: string | null;
  author: string;
  tags: string[];
  category?: string | null;
  featured: boolean;
  imageUrl?: string | null;
  status: string;
  slug?: string | null;
  contentBlocks: Array<{
    id: string;
    blockType: string;
    order: number;
    data: unknown;
  }>;
}

export class RevisionService {
  /**
   * Create a new revision snapshot of content
   */
  static async createRevision(options: CreateRevisionOptions): Promise<string> {
    const { contentId, changesSummary, changeType, createdBy } = options;

    // Get current content state
    const currentContent = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        contentBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!currentContent) {
      throw new Error('Content not found');
    }

    // Get the next revision number
    const lastRevision = await prisma.contentRevision.findFirst({
      where: { contentId },
      orderBy: { revisionNumber: 'desc' }
    });

    const nextRevisionNumber = (lastRevision?.revisionNumber || 0) + 1;

    // Create the revision with content snapshot
    const revision = await prisma.contentRevision.create({
      data: {
        contentId,
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
        changesSummary,
        changeType,
        createdBy,
        blockRevisions: {
          create: currentContent.contentBlocks.map(block => ({
            originalBlockId: block.id,
            blockType: block.blockType,
            order: block.order,
            data: block.data as unknown,
            changeType: BlockChangeType.MODIFIED
          }))
        }
      }
    });

    return revision.id;
  }

  /**
   * Get revision history for content
   */
  static async getRevisionHistory(contentId: string, limit = 20) {
    return await prisma.contentRevision.findMany({
      where: { contentId },
      orderBy: { revisionNumber: 'desc' },
      take: limit,
      include: {
        blockRevisions: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  /**
   * Get a specific revision
   */
  static async getRevision(revisionId: string) {
    return await prisma.contentRevision.findUnique({
      where: { id: revisionId },
      include: {
        blockRevisions: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  /**
   * Restore content to a specific revision
   */
  static async restoreToRevision(contentId: string, revisionId: string, restoredBy: string) {
    const revision = await this.getRevision(revisionId);
    if (!revision) {
      throw new Error('Revision not found');
    }

    if (revision.contentId !== contentId) {
      throw new Error('Revision does not belong to this content');
    }

    // Start transaction to restore content
    return await prisma.$transaction(async (tx) => {
      // Update content metadata
      await tx.content.update({
        where: { id: contentId },
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
          version: { increment: 1 }
        }
      });

      // Delete existing blocks
      await tx.contentBlock.deleteMany({
        where: { contentId }
      });

      // Recreate blocks from revision
      const newBlocks = await Promise.all(
        revision.blockRevisions.map(blockRev =>
          tx.contentBlock.create({
            data: {
              contentId,
              blockType: blockRev.blockType,
              order: blockRev.order,
              data: blockRev.data
            }
          })
        )
      );

      // Create a new revision documenting the restore
      await tx.contentRevision.create({
        data: {
          contentId,
          revisionNumber: revision.revisionNumber + 1,
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
          changesSummary: `Restored to revision ${revision.revisionNumber}`,
          changeType: RevisionType.RESTORE,
          createdBy: restoredBy,
          blockRevisions: {
            create: newBlocks.map(block => ({
              originalBlockId: block.id,
              blockType: block.blockType,
              order: block.order,
              data: block.data as unknown,
              changeType: BlockChangeType.MODIFIED
            }))
          }
        }
      });

      return newBlocks;
    });
  }

  /**
   * Compare two revisions
   */
  static async compareRevisions(revisionId1: string, revisionId2: string) {
    const [revision1, revision2] = await Promise.all([
      this.getRevision(revisionId1),
      this.getRevision(revisionId2)
    ]);

    if (!revision1 || !revision2) {
      throw new Error('One or both revisions not found');
    }

    const changes = {
      metadata: this.compareMetadata(revision1, revision2),
      blocks: this.compareBlocks(revision1.blockRevisions, revision2.blockRevisions)
    };

    return {
      revision1,
      revision2,
      changes
    };
  }

  private static compareMetadata(rev1: Record<string, unknown>, rev2: Record<string, unknown>) {
    const changes: Array<{ field: string; old: unknown; new: unknown }> = [];
    const fieldsToCompare = ['title', 'description', 'status', 'featured', 'category', 'tags'];

    fieldsToCompare.forEach(field => {
      if (JSON.stringify(rev1[field]) !== JSON.stringify(rev2[field])) {
        changes.push({
          field,
          old: rev1[field],
          new: rev2[field]
        });
      }
    });

    return changes;
  }

  private static compareBlocks(blocks1: Array<Record<string, unknown>>, blocks2: Array<Record<string, unknown>>) {
    const changes = {
      added: blocks2.filter(b2 => !blocks1.find(b1 => b1.originalBlockId === b2.originalBlockId)),
      removed: blocks1.filter(b1 => !blocks2.find(b2 => b2.originalBlockId === b1.originalBlockId)),
      modified: blocks2.filter(b2 => {
        const b1 = blocks1.find(b1 => b1.originalBlockId === b2.originalBlockId);
        return b1 && JSON.stringify(b1.data) !== JSON.stringify(b2.data);
      })
    };

    return changes;
  }

  /**
   * Delete old revisions (cleanup)
   */
  static async cleanupOldRevisions(contentId: string, keepCount = 50) {
    const revisions = await prisma.contentRevision.findMany({
      where: { contentId },
      orderBy: { revisionNumber: 'desc' },
      select: { id: true }
    });

    if (revisions.length > keepCount) {
      const toDelete = revisions.slice(keepCount);
      await prisma.contentRevision.deleteMany({
        where: {
          id: { in: toDelete.map(r => r.id) }
        }
      });
    }
  }
}