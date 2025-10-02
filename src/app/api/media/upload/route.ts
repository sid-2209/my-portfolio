import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { uploadToBlob, validateMediaFile, getImageDimensions, getVideoMetadata } from '../../../../lib/blob-storage';

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
        // Validate file (supports both images and videos)
        const validation = validateMediaFile(file);
        if (!validation.valid) {
          errors.push({ filename: file.name, error: validation.error });
          continue;
        }

        // Upload to Vercel Blob
        const blobResult = await uploadToBlob(file, folder);

        // Get media metadata based on type
        let metadata: { width: number | null, height: number | null, duration: number | null } = {
          width: null,
          height: null,
          duration: null
        };

        try {
          if (validation.mediaType === 'image') {
            const dimensions = await getImageDimensions(file);
            metadata.width = dimensions.width;
            metadata.height = dimensions.height;
          } else if (validation.mediaType === 'video') {
            const videoData = await getVideoMetadata(file);
            metadata.width = videoData.width;
            metadata.height = videoData.height;
            metadata.duration = videoData.duration;
          }
        } catch (error) {
          console.warn('Could not get media metadata:', error);
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
            width: metadata.width,
            height: metadata.height,
            duration: metadata.duration,
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