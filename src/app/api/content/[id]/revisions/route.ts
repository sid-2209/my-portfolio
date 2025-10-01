import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch revisions for the content
    const revisions = await prisma.contentRevision.findMany({
      where: {
        contentId: id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(revisions);
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revisions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Create a new revision
    const revision = await prisma.contentRevision.create({
      data: {
        contentId: id,
        title: body.title,
        description: body.description,
        contentBlocks: body.contentBlocks || [],
        metadata: body.metadata || {},
        changeType: body.changeType || 'manual',
        changeDescription: body.changeDescription
      }
    });

    return NextResponse.json(revision);
  } catch (error) {
    console.error('Error creating revision:', error);
    return NextResponse.json(
      { error: 'Failed to create revision' },
      { status: 500 }
    );
  }
}
