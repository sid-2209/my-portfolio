import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { BlockType, Prisma } from '@prisma/client';

// GET - Fetch all blocks for a content item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blocks = await prisma.contentBlock.findMany({
      where: { contentId: id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching content blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content blocks' },
      { status: 500 }
    );
  }
}

// POST - Create a new content block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { blockType, order, data } = body;

    // Validate required fields
    if (!blockType || order === undefined || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: blockType, order, data' },
        { status: 400 }
      );
    }

    // Check if content exists
    const content = await prisma.content.findUnique({
      where: { id }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Create the block
    const block = await prisma.contentBlock.create({
      data: {
        contentId: id,
        blockType,
        order,
        data
      }
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error('Error creating content block:', error);
    return NextResponse.json(
      { error: 'Failed to create content block' },
      { status: 500 }
    );
  }
}

// PUT - Update multiple blocks (for reordering) - ATOMIC TRANSACTION
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { blocks } = body;

    // Validate input
    if (!Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Blocks must be an array' },
        { status: 400 }
      );
    }

    // Validate each block structure
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block.blockType || block.data === undefined) {
        return NextResponse.json(
          { error: `Block at index ${i} is missing required fields: blockType or data` },
          { status: 400 }
        );
      }
    }

    // Verify content exists before proceeding
    const content = await prisma.content.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Clean block data to remove undefined values (they cause JSON serialization issues)
    const cleanBlocks = blocks.map(block => ({
      ...block,
      data: JSON.parse(JSON.stringify(block.data)) // Removes undefined values
    }));

    // ATOMIC TRANSACTION: Delete and recreate all blocks
    // This ensures either all operations succeed or all fail
    const updatedBlocks = await prisma.$transaction(async (tx) => {
      // Step 1: Delete all existing blocks for this content
      await tx.contentBlock.deleteMany({
        where: { contentId: id }
      });

      // Step 2: Create all new blocks sequentially to avoid unique constraint conflicts
      const newBlocks = [];
      for (let index = 0; index < cleanBlocks.length; index++) {
        const block = cleanBlocks[index];
        const createdBlock = await tx.contentBlock.create({
          data: {
            contentId: id,
            blockType: block.blockType as BlockType,
            order: index, // Use index to ensure unique, sequential order
            data: block.data as Prisma.InputJsonValue
          }
        });
        newBlocks.push(createdBlock);
      }

      return newBlocks;
    }, {
      timeout: 15000, // 15 second timeout for the transaction (increased for sequential operations)
      maxWait: 5000,  // Maximum time to wait for a transaction slot
    });

    return NextResponse.json(updatedBlocks);
  } catch (error) {
    console.error('Error updating content blocks:', error);

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2025':
          return NextResponse.json(
            { error: 'Content not found. Cannot update blocks for non-existent content.' },
            { status: 404 }
          );
        case 'P2034': // Transaction failed due to write conflict
          return NextResponse.json(
            { error: 'Update conflict. Please refresh and try again.' },
            { status: 409 }
          );
        case 'P1001': // Timeout
          return NextResponse.json(
            { error: 'Request timeout. Please try again.' },
            { status: 408 }
          );
        default:
          console.error('Unhandled Prisma error:', error.code, error);
          return NextResponse.json(
            { error: 'Database error occurred while updating content blocks.' },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update content blocks' },
      { status: 500 }
    );
  }
}
