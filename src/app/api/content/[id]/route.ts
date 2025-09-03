import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the status if it's being updated
    if (body.status && !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be DRAFT, PUBLISHED, or ARCHIVED' },
        { status: 400 }
      );
    }

    const updateData: {
      featured?: boolean;
      title?: string;
      description?: string;
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
      slug?: string;
    } = {};

    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.status) updateData.status = body.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    if (body.slug) updateData.slug = body.slug;

    const updatedContent = await prisma.content.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        contentBlocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
