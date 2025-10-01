import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '../../../services/templateService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      category: searchParams.get('category') || undefined,
      blockType: searchParams.get('blockType') as 'PARAGRAPH' | 'HEADING' | 'IMAGE' | 'CODE_BLOCK' | 'QUOTE' | 'LIST' | 'DIVIDER' | 'CUSTOM' || undefined,
      isPublic: searchParams.get('isPublic') ? searchParams.get('isPublic') === 'true' : undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      query: searchParams.get('query') || undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined
    };

    const snippets = await TemplateService.getSnippets(filters);
    return NextResponse.json(snippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch snippets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const snippet = await TemplateService.createSnippet(body);
    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    console.error('Error creating snippet:', error);
    return NextResponse.json(
      { error: 'Failed to create snippet' },
      { status: 500 }
    );
  }
}