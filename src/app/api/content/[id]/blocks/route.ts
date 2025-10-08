import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { BlockType, Prisma } from '@prisma/client';

// PHASE 2: Robust Data Cleaning Function
/**
 * Deeply cleans object data to ensure JSON compatibility and remove problematic values
 * - Removes undefined values
 * - Converts functions to null
 * - Handles circular references
 * - Validates data size
 * - Removes non-serializable types (Symbol, BigInt, etc.)
 */
function deepCleanBlockData(obj: unknown, maxDepth = 10, currentDepth = 0, seen = new WeakSet()): unknown {
  // Prevent infinite recursion
  if (currentDepth > maxDepth) {
    console.warn('Max depth reached in deepCleanBlockData');
    return null;
  }

  // Handle primitive types
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') {
    // Handle NaN, Infinity
    if (!Number.isFinite(obj)) return null;
    return obj;
  }
  if (typeof obj === 'boolean') return obj;

  // Remove non-serializable types
  if (typeof obj === 'function') return null;
  if (typeof obj === 'symbol') return null;
  if (typeof obj === 'bigint') return obj.toString(); // Convert BigInt to string

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // Handle objects and arrays
  if (typeof obj === 'object') {
    // Detect circular references
    if (seen.has(obj as object)) {
      console.warn('Circular reference detected in block data');
      return null;
    }
    seen.add(obj as object);

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj
        .map(item => deepCleanBlockData(item, maxDepth, currentDepth + 1, seen))
        .filter(item => item !== null && item !== undefined);
    }

    // Handle plain objects
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip prototype properties
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

      const cleanedValue = deepCleanBlockData(value, maxDepth, currentDepth + 1, seen);
      // Only include non-null, non-undefined values
      if (cleanedValue !== null && cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }

  // Fallback for unknown types
  console.warn('Unknown type in deepCleanBlockData:', typeof obj);
  return null;
}

/**
 * Validates block data size to prevent database overload
 */
function validateBlockDataSize(data: unknown, maxSizeBytes = 1048576): { valid: boolean; size: number; error?: string } {
  try {
    const jsonString = JSON.stringify(data);
    const sizeInBytes = new Blob([jsonString]).size;

    if (sizeInBytes > maxSizeBytes) {
      return {
        valid: false,
        size: sizeInBytes,
        error: `Block data size (${(sizeInBytes / 1024).toFixed(2)}KB) exceeds maximum allowed size (${(maxSizeBytes / 1024).toFixed(2)}KB)`
      };
    }

    return { valid: true, size: sizeInBytes };
  } catch (error) {
    return {
      valid: false,
      size: 0,
      error: `Failed to validate data size: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

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
  const { id } = await params;
  let blocks: unknown[] = [];

  try {
    const body = await request.json();
    blocks = body.blocks;

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

    // PHASE 2: Clean and validate block data
    console.log(`[Blocks API] Starting to clean ${blocks.length} blocks for content: ${id}`);
    const cleanBlocks = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      try {
        console.log(`[Blocks API] Cleaning block ${i + 1}/${blocks.length}: ${block.blockType}`);

        // Deep clean the block data
        const cleanedData = deepCleanBlockData(block.data);

        if (cleanedData === null || cleanedData === undefined) {
          console.error(`[Blocks API] Block ${i} produced null/undefined data after cleaning`);
          return NextResponse.json(
            {
              error: `Block at index ${i} has invalid data that could not be cleaned`,
              blockType: block.blockType,
              blockIndex: i
            },
            { status: 400 }
          );
        }

        // Validate data size
        const sizeValidation = validateBlockDataSize(cleanedData);
        if (!sizeValidation.valid) {
          console.error(`[Blocks API] Block ${i} failed size validation:`, sizeValidation.error);
          return NextResponse.json(
            {
              error: sizeValidation.error || 'Block data size validation failed',
              blockType: block.blockType,
              blockIndex: i,
              dataSize: `${(sizeValidation.size / 1024).toFixed(2)}KB`
            },
            { status: 400 }
          );
        }

        console.log(`[Blocks API] Block ${i} cleaned successfully (${(sizeValidation.size / 1024).toFixed(2)}KB)`);

        cleanBlocks.push({
          ...block,
          data: cleanedData
        });
      } catch (cleanError) {
        console.error(`[Blocks API] Error cleaning block ${i}:`, cleanError);
        console.error(`[Blocks API] Block type: ${block.blockType}`);
        console.error(`[Blocks API] Block data keys:`, block.data && typeof block.data === 'object' ? Object.keys(block.data as object) : 'N/A');

        return NextResponse.json(
          {
            error: `Failed to process block at index ${i}`,
            blockType: block.blockType,
            details: process.env.NODE_ENV === 'development' && cleanError instanceof Error ? cleanError.message : undefined
          },
          { status: 400 }
        );
      }
    }

    console.log(`[Blocks API] All ${cleanBlocks.length} blocks cleaned successfully, starting transaction...`);

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
      timeout: 30000, // 30 second timeout for the transaction (increased for large block counts)
      maxWait: 10000,  // Maximum time to wait for a transaction slot
    });

    return NextResponse.json(updatedBlocks);
  } catch (error) {
    // PHASE 1: Enhanced Error Logging for Diagnosis
    console.error('===== CONTENT BLOCKS UPDATE ERROR =====');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error && typeof error === 'object' && 'code' in error ? error.code : 'NO_CODE',
      meta: error && typeof error === 'object' && 'meta' in error ? error.meta : null,
      name: error instanceof Error ? error.name : 'Unknown',
      contentId: id,
      blockCount: blocks?.length || 0,
      timestamp: new Date().toISOString()
    });

    // Log error stack for debugging
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }

    // Safely log first problematic block structure (without exposing sensitive data)
    if (blocks && blocks.length > 0) {
      try {
        const firstBlock = blocks[0] as { blockType?: string; data?: unknown; order?: number };
        console.error('First block structure:', {
          blockType: firstBlock.blockType,
          hasData: !!firstBlock.data,
          dataType: typeof firstBlock.data,
          dataKeys: firstBlock.data && typeof firstBlock.data === 'object' ? Object.keys(firstBlock.data as object) : [],
          dataSize: firstBlock.data ? JSON.stringify(firstBlock.data).length : 0,
          order: firstBlock.order
        });
      } catch (logError) {
        console.error('Could not log block structure:', logError);
      }
    }

    // Log all block types for pattern analysis
    if (blocks && blocks.length > 0) {
      console.error('Block types in request:', blocks.map((b, idx) => {
        const block = b as { blockType?: string };
        return `${idx}: ${block.blockType}`;
      }).join(', '));
    }

    console.error('=====================================');

    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: unknown; message?: string };

      switch (prismaError.code) {
        case 'P2025':
          return NextResponse.json(
            {
              error: 'Content not found. Cannot update blocks for non-existent content.',
              details: process.env.NODE_ENV === 'development' ? { code: prismaError.code, meta: prismaError.meta } : undefined
            },
            { status: 404 }
          );
        case 'P2034': // Transaction failed due to write conflict
          return NextResponse.json(
            {
              error: 'Update conflict. Please refresh and try again.',
              retryable: true,
              details: process.env.NODE_ENV === 'development' ? { code: prismaError.code } : undefined
            },
            { status: 409 }
          );
        case 'P1001': // Timeout
          return NextResponse.json(
            {
              error: 'Request timeout. Please try again.',
              retryable: true,
              details: process.env.NODE_ENV === 'development' ? { code: prismaError.code } : undefined
            },
            { status: 408 }
          );
        case 'P2002': // Unique constraint violation
          return NextResponse.json(
            {
              error: 'Duplicate block order detected. This may be due to concurrent updates.',
              retryable: true,
              details: process.env.NODE_ENV === 'development' ? { code: prismaError.code, meta: prismaError.meta } : undefined
            },
            { status: 409 }
          );
        case 'P2003': // Foreign key constraint violation
          return NextResponse.json(
            {
              error: 'Invalid content reference. The content may have been deleted.',
              details: process.env.NODE_ENV === 'development' ? { code: prismaError.code, meta: prismaError.meta } : undefined
            },
            { status: 400 }
          );
        default:
          console.error('Unhandled Prisma error code:', prismaError.code);
          return NextResponse.json(
            {
              error: 'Database error occurred while updating content blocks.',
              message: process.env.NODE_ENV === 'development' && prismaError.message ? prismaError.message : undefined,
              code: process.env.NODE_ENV === 'development' ? prismaError.code : undefined,
              retryable: false
            },
            { status: 500 }
          );
      }
    }

    // Generic error fallback
    return NextResponse.json(
      {
        error: 'Failed to update content blocks',
        message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
        retryable: false
      },
      { status: 500 }
    );
  }
}
