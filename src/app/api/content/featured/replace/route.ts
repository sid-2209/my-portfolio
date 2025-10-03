import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { replaceFeaturedContent } from '../../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.oldId || !body.newId) {
      return NextResponse.json(
        { error: 'Both oldId and newId are required' },
        { status: 400 }
      );
    }

    if (typeof body.oldId !== 'string' || typeof body.newId !== 'string') {
      return NextResponse.json(
        { error: 'oldId and newId must be strings' },
        { status: 400 }
      );
    }

    if (body.oldId === body.newId) {
      return NextResponse.json(
        { error: 'oldId and newId cannot be the same' },
        { status: 400 }
      );
    }

    const result = await replaceFeaturedContent(body.oldId, body.newId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to replace featured content' },
        { status: 500 }
      );
    }

    // Trigger revalidation of homepage and admin dashboard
    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      message: 'Featured content replaced successfully'
    });
  } catch (error) {
    console.error('Error in featured content replacement API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}