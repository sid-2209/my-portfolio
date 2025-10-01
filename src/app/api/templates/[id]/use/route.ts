import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '../../../../../services/templateService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await TemplateService.applyTemplate(id);
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error using template:', error);
    return NextResponse.json(
      { error: 'Failed to use template' },
      { status: 500 }
    );
  }
}