import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/db';

// PUT - Update a specific content block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { error: 'Missing data field' },
        { status: 400 }
      );
    }

    // Check if block exists and belongs to the content
    const existingBlock = await prisma.contentBlock.findFirst({
      where: {
        id: blockId,
        contentId: id
      }
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    // Update the block
    const updatedBlock = await prisma.contentBlock.update({
      where: { id: blockId },
      data: { data }
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Error updating content block:', error);
    return NextResponse.json(
      { error: 'Failed to update content block' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific content block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    // Check if block exists and belongs to the content
    const existingBlock = await prisma.contentBlock.findFirst({
      where: {
        id: blockId,
        contentId: id
      }
    });

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    // Delete the block
    await prisma.contentBlock.delete({
      where: { id: blockId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content block:', error);
    return NextResponse.json(
      { error: 'Failed to delete content block' },
      { status: 500 }
    );
  }
}
