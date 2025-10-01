import { put, del, list } from '@vercel/blob';
import { uploadToLocal } from './local-storage';

export interface UploadResult {
  url: string;
  blobId: string;
  size: number;
  mimetype: string;
  filename: string;
}

export async function uploadToBlob(file: File, folder: string): Promise<UploadResult> {
  // Check if Vercel Blob token is available
  const hasVercelToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!hasVercelToken) {
    console.log('BLOB_READ_WRITE_TOKEN not found, falling back to local storage for development');
    return uploadToLocal(file, folder);
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${folder}/${timestamp}-${sanitizedName}`;

  try {
    const blob = await put(filename, file, {
      access: 'public',
    });

    return {
      url: blob.url,
      blobId: blob.pathname,
      size: file.size,
      mimetype: file.type,
      filename: sanitizedName
    };
  } catch (error) {
    console.error('Blob upload error:', error);

    // Fallback to local storage if Vercel Blob fails
    console.log('Vercel Blob upload failed, falling back to local storage');
    return uploadToLocal(file, folder);
  }
}

export async function deleteFromBlob(blobId: string): Promise<void> {
  try {
    // Check if it's a local storage file
    if (blobId.startsWith('local:')) {
      const { deleteFromLocal } = await import('./local-storage');
      return deleteFromLocal(blobId);
    }

    // Otherwise, use Vercel Blob
    const hasVercelToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!hasVercelToken) {
      console.warn('Cannot delete from Vercel Blob: BLOB_READ_WRITE_TOKEN not found');
      return;
    }

    await del(blobId);
  } catch (error) {
    console.error('Blob deletion error:', error);
    throw new Error('Failed to delete file from blob storage');
  }
}

export async function listBlobFiles(folder?: string) {
  try {
    const hasVercelToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!hasVercelToken) {
      console.warn('Cannot list Vercel Blob files: BLOB_READ_WRITE_TOKEN not found');
      return [];
    }

    const { blobs } = await list({
      prefix: folder,
    });
    return blobs;
  } catch (error) {
    console.error('Blob list error:', error);
    return [];
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please use JPEG, PNG, GIF, or WebP.'
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: 'File size too large. Maximum size is 10MB.'
    };
  }

  return { valid: true };
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Server-side: Return null dimensions, will be handled gracefully
      reject(new Error('Image dimensions not available on server-side'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}