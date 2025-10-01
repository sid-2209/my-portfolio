import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { deleteFromBlob } from '../../../../lib/blob-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const media = await prisma.media.findUnique({
      where: { id }
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(media);

  } catch (error) {
    console.error('Media GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedUpdates = ['altText', 'caption', 'folder'];
    const updateData: Record<string, unknown> = {};

    // Only allow specific fields to be updated
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    updateData.updatedAt = new Date();

    const media = await prisma.media.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(media);

  } catch (error) {
    console.error('Media PATCH error:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update media' },
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

    // Get media record first
    const media = await prisma.media.findUnique({
      where: { id }
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Check if media is being used in content
    const usageCheck = await prisma.media.findFirst({
      where: {
        id,
        OR: [
          { contentId: { not: null } },
          { blockId: { not: null } }
        ]
      }
    });

    if (usageCheck) {
      return NextResponse.json(
        {
          error: 'Cannot delete media that is currently being used in content',
          inUse: true
        },
        { status: 409 }
      );
    }

    // Delete from Vercel Blob
    try {
      await deleteFromBlob(media.blobId);
    } catch (blobError) {
      console.warn('Failed to delete from blob, continuing with database deletion:', blobError);
    }

    // Delete from database
    await prisma.media.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Media DELETE error:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}