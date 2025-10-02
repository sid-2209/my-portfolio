'use client';

import { useState, useRef } from 'react';
import { Upload, Video as VideoIcon, X, Edit, Eye, Play } from 'lucide-react';

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

interface VideoPickerProps {
  value?: string; // Current video URL
  onChange: (media: MediaItem | null) => void;
  onUrlChange?: (url: string) => void; // For backward compatibility
  label?: string;
  folder?: string; // Auto-organize by source
  source: string; // Track where video is used
  contentId?: string; // Link to content if applicable
  blockId?: string; // If from content block
  className?: string;
  placeholder?: string;
}

export default function VideoPicker({
  value,
  onChange,
  onUrlChange,
  label = "Video File",
  folder = "general",
  source,
  contentId,
  blockId,
  className = "",
  placeholder = "No video selected"
}: VideoPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type (videos and GIFs)
    if (!file.type.startsWith('video/') && file.type !== 'image/gif') {
      alert('Please select a video file or GIF');
      return;
    }

    // Validate file size (50MB for videos, 10MB for GIFs)
    const maxSize = file.type === 'image/gif' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size too large. Maximum size is ${file.type === 'image/gif' ? '10MB for GIFs' : '50MB for videos'}.`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', folder);
      formData.append('source', source);
      formData.append('uploadedBy', 'Sid'); // TODO: Get from auth context

      if (contentId) {
        formData.append('contentId', contentId);
      }

      if (blockId) {
        formData.append('blockId', blockId);
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.uploaded.length > 0) {
        const uploadedMedia = result.uploaded[0];
        onChange(uploadedMedia);

        // For backward compatibility
        if (onUrlChange) {
          onUrlChange(uploadedMedia.blobUrl);
        }
      } else {
        alert(result.errors?.[0]?.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removeVideo = () => {
    onChange(null);
    if (onUrlChange) {
      onUrlChange('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-2">
          {label}
        </label>
      )}

      <div className="space-y-4">
        {/* Current Video Display */}
        {value ? (
          <div className="relative group">
            <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-200">
              <video
                src={value}
                className="w-full h-full object-contain"
                controls
              />

              {/* Overlay with actions */}
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                  title="View video fullscreen"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>

                <button
                  type="button"
                  onClick={openFileDialog}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                  title="Change video"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                </button>

                <button
                  type="button"
                  onClick={removeVideo}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                  title="Remove video"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Hover over the video to view, edit, or remove
            </p>
          </div>
        ) : (
          /* Upload Area */
          <div
            className={`relative w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : uploading
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={uploading ? undefined : openFileDialog}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              {uploading ? (
                <>
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm text-gray-600">Uploading video...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {dragActive ? (
                      <Upload className="w-6 h-6 text-blue-600" />
                    ) : (
                      <VideoIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {dragActive ? 'Drop video here' : 'Upload a video'}
                  </h3>

                  <p className="text-xs text-gray-500 mb-4">
                    Drag and drop a video, or click to browse
                  </p>

                  <div className="flex flex-col items-center space-y-1 text-xs text-gray-400">
                    <div className="flex items-center space-x-2">
                      <span>Supports: MP4, MOV, WEBM, AVI, GIF</span>
                    </div>
                    <span>Max 50MB (videos) • 10MB (GIFs)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/gif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={openFileDialog}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            {value ? 'Change Video' : 'Select Video'}
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
          >
            <VideoIcon className="w-4 h-4 mr-2" />
            Browse Library
          </button>
        </div>
      </div>

      {/* Video Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {value && (
              <video
                src={value}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
