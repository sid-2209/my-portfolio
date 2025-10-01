import { writeFile } from 'fs/promises';
import { join } from 'path';
import { UploadResult } from './blob-storage';

export async function uploadToLocal(file: File, folder: string): Promise<UploadResult> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${sanitizedName}`;

  try {
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create file path
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    const filePath = join(uploadDir, filename);

    // Write file to local storage
    await writeFile(filePath, buffer);

    // Return URL that will work in development
    const url = `/uploads/${folder}/${filename}`;

    return {
      url,
      blobId: `local:${folder}/${filename}`,
      size: file.size,
      mimetype: file.type,
      filename: sanitizedName
    };
  } catch (error) {
    console.error('Local upload error:', error);
    throw new Error('Failed to upload file to local storage');
  }
}

export async function deleteFromLocal(blobId: string): Promise<void> {
  try {
    if (!blobId.startsWith('local:')) {
      throw new Error('Invalid local blob ID');
    }

    const relativePath = blobId.replace('local:', '');
    const filePath = join(process.cwd(), 'public', 'uploads', relativePath);

    // For now, we'll just log the deletion since unlink requires fs
    console.log('Would delete local file:', filePath);
    // TODO: Implement actual file deletion for production
  } catch (error) {
    console.error('Local deletion error:', error);
    throw new Error('Failed to delete file from local storage');
  }
}