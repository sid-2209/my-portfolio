import { NextRequest, NextResponse } from "next/server";
import { prisma, getCurrentFeaturedContent } from "../../../../lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid content ID provided.' },
        { status: 400 }
      );
    }

    // Validate request body
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'No data provided for update.' },
        { status: 400 }
      );
    }

    // First, check if the content exists
    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found. The content you are trying to update does not exist.' },
        { status: 404 }
      );
    }

    // Validate the status if it's being updated
    if (body.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED' },
        { status: 400 }
      );
    }

    // Validate title if being updated
    if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
      return NextResponse.json(
        { error: 'Title must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Validate description if being updated
    if (body.description !== undefined && (typeof body.description !== 'string' || body.description.trim() === '')) {
      return NextResponse.json(
        { error: 'Description must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Validate slug if being updated
    if (body.slug !== undefined) {
      if (typeof body.slug !== 'string' || body.slug.trim() === '') {
        return NextResponse.json(
          { error: 'Slug must be a non-empty string.' },
          { status: 400 }
        );
      }

      // Check if slug is unique (excluding current content)
      const existingSlug = await prisma.content.findFirst({
        where: {
          slug: body.slug,
          id: { not: id }
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'A content item with this slug already exists. Please choose a different slug.' },
          { status: 409 }
        );
      }
    }

    // Handle featured content validation (5-post carousel limit)
    if (body.featured !== undefined && body.featured === true) {
      // Check if we're already at the 5-post limit
      const currentFeaturedCount = await prisma.content.count({
        where: {
          featured: true,
          id: { not: id } // Exclude current item if it's already featured
        }
      });

      if (currentFeaturedCount >= 5) {
        return NextResponse.json({
          error: 'Maximum 5 featured posts allowed. Please unfeature another post first.',
          code: 'FEATURED_LIMIT_REACHED'
        }, { status: 409 });
      }
    }

    // OPTIMISTIC LOCKING: Check version for concurrency control
    const currentVersion = body.version;
    if (currentVersion !== undefined && typeof currentVersion !== 'number') {
      return NextResponse.json(
        { error: 'Version must be a number for optimistic locking.' },
        { status: 400 }
      );
    }

    const updateData: {
      featured?: boolean;
      featuredOrder?: number | null;
      title?: string;
      description?: string | null;
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
      slug?: string;
      contentType?: string;
      category?: string | null;
      author?: string;
      imageUrl?: string | null;
      contentUrl?: string | null;
      tags?: string[];
      version?: number;
    } = {};

    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.featuredOrder !== undefined) updateData.featuredOrder = body.featuredOrder;
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.status) updateData.status = body.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    if (body.slug) updateData.slug = body.slug;
    if (body.contentType) updateData.contentType = body.contentType;
    if (body.category !== undefined) updateData.category = body.category || null;
    if (body.author) updateData.author = body.author;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
    if (body.contentUrl !== undefined) updateData.contentUrl = body.contentUrl || null;
    if (body.tags) updateData.tags = body.tags;

    // Increment version for optimistic locking
    updateData.version = (currentVersion || existingContent.version || 1) + 1;

    // Use optimistic locking if version is provided
    const whereClause = currentVersion !== undefined
      ? { id, version: currentVersion }
      : { id };

    const updatedContent = await prisma.content.update({
      where: whereClause,
      data: updateData,
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2025':
          // Check if this is a version mismatch (optimistic locking conflict)
          if ((error as { message?: string }).message && (error as { message?: string }).message!.includes('version')) {
            return NextResponse.json(
              {
                error: 'Content has been modified by another user. Please refresh and try again.',
                code: 'VERSION_CONFLICT'
              },
              { status: 409 }
            );
          }
          return NextResponse.json(
            { error: 'Content not found. The record you are trying to update does not exist.' },
            { status: 404 }
          );
        case 'P2002':
          return NextResponse.json(
            { error: 'A content item with this slug already exists. Please choose a different slug.' },
            { status: 409 }
          );
        case 'P2034': // Transaction conflict
          return NextResponse.json(
            {
              error: 'Update conflict detected. Please refresh and try again.',
              code: 'TRANSACTION_CONFLICT'
            },
            { status: 409 }
          );
        default:
          console.error('Unhandled Prisma error:', error.code, error);
          return NextResponse.json(
            { error: 'Database error occurred while updating content.' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        contentBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid content ID provided.' },
        { status: 400 }
      );
    }

    // First, check if the content exists
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: {
        contentBlocks: true
      }
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found. The content you are trying to delete does not exist.' },
        { status: 404 }
      );
    }

    // Delete all associated content blocks first (due to foreign key constraints)
    await prisma.contentBlock.deleteMany({
      where: { contentId: id }
    });

    // Delete the content item
    await prisma.content.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Content deleted successfully',
      deletedContent: {
        id: existingContent.id,
        title: existingContent.title
      }
    });

  } catch (error) {
    console.error('Error deleting content:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2025':
          return NextResponse.json(
            { error: 'Content not found. The record you are trying to delete does not exist.' },
            { status: 404 }
          );
        case 'P2003':
          return NextResponse.json(
            { error: 'Cannot delete content because it has related records. Please contact support.' },
            { status: 409 }
          );
        default:
          return NextResponse.json(
            { error: 'Database error occurred while deleting content.' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
