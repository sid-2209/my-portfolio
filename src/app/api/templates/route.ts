import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '../../../services/templateService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      category: searchParams.get('category') || undefined,
      contentType: searchParams.get('contentType') || undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      query: searchParams.get('query') || undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined
    };

    const templates = await TemplateService.getTemplates(filters);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = await TemplateService.createTemplate(body);
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}