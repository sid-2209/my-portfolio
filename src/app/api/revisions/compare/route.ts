import { NextRequest, NextResponse } from 'next/server';
import { RevisionService } from '../../../../services/revisionService';

// POST /api/revisions/compare - Compare two revisions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { revisionId1, revisionId2 } = body;

    if (!revisionId1 || !revisionId2) {
      return NextResponse.json(
        { error: 'Both revisionId1 and revisionId2 are required' },
        { status: 400 }
      );
    }

    const comparison = await RevisionService.compareRevisions(revisionId1, revisionId2);

    return NextResponse.json(comparison);
  } catch (error) {
    console.error('Error comparing revisions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compare revisions' },
      { status: 500 }
    );
  }
}