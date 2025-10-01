import { NextRequest, NextResponse } from 'next/server';
import { RevisionService } from '../../../../../../services/revisionService';

// GET /api/content/[id]/revisions/[revisionId] - Get specific revision
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const { revisionId } = await params;

    const revision = await RevisionService.getRevision(revisionId);

    if (!revision) {
      return NextResponse.json(
        { error: 'Revision not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(revision);
  } catch (error) {
    console.error('Error fetching revision:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revision' },
      { status: 500 }
    );
  }
}