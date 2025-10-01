import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { uploadToBlob, validateImageFile, getImageDimensions } from '../../../../lib/blob-storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'general';
    const source = (formData.get('source') as string) || 'general';
    const uploadedBy = (formData.get('uploadedBy') as string) || 'Sid';
    const contentId = formData.get('contentId') as string;
    const blockId = formData.get('blockId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      try {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
          errors.push({ filename: file.name, error: validation.error });
          continue;
        }

        // Upload to Vercel Blob
        const blobResult = await uploadToBlob(file, folder);

        // Get image dimensions
        let dimensions: { width: number | null, height: number | null } = { width: null, height: null };
        try {
          dimensions = await getImageDimensions(file);
        } catch (error) {
          console.warn('Could not get image dimensions:', error);
        }

        // Save to database
        const media = await prisma.media.create({
          data: {
            filename: blobResult.filename,
            originalName: file.name,
            mimetype: file.type,
            size: file.size,
            blobUrl: blobResult.url,
            blobId: blobResult.blobId,
            width: dimensions.width,
            height: dimensions.height,
            folder,
            source,
            uploadedBy,
            contentId: contentId || null,
            blockId: blockId || null,
          }
        });

        uploadResults.push(media);
      } catch (error) {
        console.error('Upload error for file:', file.name, error);
        errors.push({
          filename: file.name,
          error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
      }
    }

    return NextResponse.json({
      success: uploadResults.length > 0,
      uploaded: uploadResults,
      errors,
      message: `${uploadResults.length} file(s) uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
    });

  } catch (error) {
    console.error('Media upload API error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload request' },
      { status: 500 }
    );
  }
}