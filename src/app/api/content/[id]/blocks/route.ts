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

// PUT - Update multiple blocks (for reordering)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { blocks } = body;

    if (!Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Blocks must be an array' },
        { status: 400 }
      );
    }

    // First, delete all existing blocks for this content
    await prisma.contentBlock.deleteMany({
      where: { contentId: id }
    });

    // Then create all blocks with new data, ensuring unique order values
    const updatedBlocks = await prisma.$transaction(
      blocks.map((block: { blockType: string; data: unknown }, index: number) =>
        prisma.contentBlock.create({
          data: {
            contentId: id,
            blockType: block.blockType as BlockType,
            order: index, // Use index to ensure unique, sequential order
            data: block.data as Prisma.InputJsonValue
          }
        })
      )
    );

    return NextResponse.json(updatedBlocks);
  } catch (error) {
    console.error('Error updating content blocks:', error);
    return NextResponse.json(
      { error: 'Failed to update content blocks' },
      { status: 500 }
    );
  }
}
