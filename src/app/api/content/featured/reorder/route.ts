import { NextRequest, NextResponse } from "next/server";
import { updateFeaturedOrder } from "../../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderedIds } = body;

    // Validate request body
    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: 'orderedIds must be an array of content IDs' },
        { status: 400 }
      );
    }

    // Validate IDs
    if (orderedIds.length === 0) {
      return NextResponse.json(
        { error: 'orderedIds array cannot be empty' },
        { status: 400 }
      );
    }

    // Check maximum limit
    if (orderedIds.length > 5) {
      return NextResponse.json(
        { error: 'Cannot have more than 5 featured posts' },
        { status: 400 }
      );
    }

    // Validate all IDs are strings
    if (!orderedIds.every(id => typeof id === 'string')) {
      return NextResponse.json(
        { error: 'All IDs must be strings' },
        { status: 400 }
      );
    }

    // Update the featured order
    const result = await updateFeaturedOrder(orderedIds);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update featured order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Featured order updated successfully',
      count: orderedIds.length
    });

  } catch (error) {
    console.error('Error updating featured order:', error);
    return NextResponse.json(
      { error: 'Failed to update featured order' },
      { status: 500 }
    );
  }
}
