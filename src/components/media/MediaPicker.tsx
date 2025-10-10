'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Video as VideoIcon, X, Edit, Eye } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  blobUrl: string;
  altText?: string | null;
  caption?: string | null;
  size: number;
  mimetype: string;
  duration?: number | null;
  createdAt: string;
}

interface MediaPickerProps {
  value?: string; // Current media URL
  onChange: (media: MediaItem | null) => void;
  onUrlChange?: (url: string) => void; // For backward compatibility
  label?: string;
  folder?: string; // Auto-organize by source
  source: string; // Track where media is used
  contentId?: string; // Link to content if applicable
  blockId?: string; // If from content block
  className?: string;
  placeholder?: string;
  acceptImages?: boolean; // Allow images
  acceptVideos?: boolean; // Allow videos
}

export default function MediaPicker({
  value,
  onChange,
  onUrlChange,
  label = "Featured Media",
  folder = "general",
  source,
  contentId,
  blockId,
  className = "",
  placeholder = "No media selected",
  acceptImages = true,
  acceptVideos = true
}: MediaPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to detect if URL is a video
  const isVideoUrl = (url: string): boolean => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) ||
           url.includes('video/');
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    if (isImage && !acceptImages) {
      alert('Image files are not accepted');
      return;
    }

    if (isVideo && !acceptVideos) {
      alert('Video files are not accepted');
      return;
    }

    // Validate file size (50MB limit for videos, 10MB for images)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', folder);
      formData.append('source', source);
      formData.append('uploadedBy', 'Sid');
      if (contentId) formData.append('contentId', contentId);
      if (blockId) formData.append('blockId', blockId);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const uploadedMedia = result.uploaded?.[0];

      if (!uploadedMedia) {
        throw new Error('No media returned from upload');
      }

      onChange(uploadedMedia);
      if (onUrlChange) onUrlChange(uploadedMedia.blobUrl);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (onUrlChange) onUrlChange('');
  };

  // Build accept string based on props
  const getAcceptString = () => {
    const accepts = [];
    if (acceptImages) accepts.push('image/*');
    if (acceptVideos) accepts.push('video/*');
    return accepts.join(',');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-200 mb-2">
        {label}
      </label>

      {/* Display current media */}
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-800">
            {isVideoUrl(value) ? (
              <video
                src={value}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={value}
                alt="Selected media"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Action buttons overlay */}
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => window.open(value, '_blank')}
              className="p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors"
              title="Preview"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors"
              title="Change"
            >
              <Edit className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleRemove}
              className="p-2 bg-red-600/70 hover:bg-red-600/90 rounded-lg transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload area when no media */
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptString()}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {acceptImages && <ImageIcon className="w-10 h-10 text-gray-400" />}
              {acceptVideos && <VideoIcon className="w-10 h-10 text-gray-400" />}
            </div>
            <div>
              <p className="text-gray-300 mb-1">{placeholder}</p>
              <p className="text-sm text-gray-500">
                Drag and drop or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                {acceptImages && acceptVideos && 'Images (max 10MB) or Videos (max 50MB)'}
                {acceptImages && !acceptVideos && 'Images only (max 10MB)'}
                {!acceptImages && acceptVideos && 'Videos only (max 50MB)'}
              </p>
            </div>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
              <div className="text-white">
                <Upload className="w-8 h-8 animate-pulse mx-auto mb-2" />
                <p>Uploading...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
