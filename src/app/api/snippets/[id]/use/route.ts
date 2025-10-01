import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '../../../../../services/templateService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snippet = await TemplateService.applySnippet(id);
    return NextResponse.json(snippet);
  } catch (error) {
    console.error('Error using snippet:', error);
    return NextResponse.json(
      { error: 'Failed to use snippet' },
      { status: 500 }
    );
  }
}