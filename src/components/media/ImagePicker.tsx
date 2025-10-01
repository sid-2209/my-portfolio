'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Edit, Eye } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  blobUrl: string;
  altText?: string | null;
  caption?: string | null;
  size: number;
  mimetype: string;
  createdAt: string;
}

interface ImagePickerProps {
  value?: string; // Current image URL
  onChange: (media: MediaItem | null) => void;
  onUrlChange?: (url: string) => void; // For backward compatibility
  label?: string;
  folder?: string; // Auto-organize by source
  source: string; // Track where image is used
  contentId?: string; // Link to content if applicable
  blockId?: string; // If from content block
  className?: string;
  placeholder?: string;
}

export default function ImagePicker({
  value,
  onChange,
  onUrlChange,
  label = "Featured Image",
  folder = "general",
  source,
  contentId,
  blockId,
  className = "",
  placeholder = "No image selected"
}: ImagePickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Maximum size is 10MB.');
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

  const removeImage = () => {
    onChange(null);
    if (onUrlChange) {
      onUrlChange('');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-gray-700 text-sm font-medium mb-2">
          {label}
        </label>
      )}

      <div className="space-y-4">
        {/* Current Image Display */}
        {value ? (
          <div className="relative group">
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={value}
                alt="Selected image"
                className="w-full h-full object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="View image"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    type="button"
                    onClick={openFileDialog}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Change image"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                  </button>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Click the image to view, edit, or remove
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
                  <p className="text-sm text-gray-600">Uploading image...</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    {dragActive ? (
                      <Upload className="w-6 h-6 text-blue-600" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {dragActive ? 'Drop image here' : 'Upload an image'}
                  </h3>

                  <p className="text-xs text-gray-500 mb-4">
                    Drag and drop an image, or click to browse
                  </p>

                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>Supports: JPG, PNG, GIF, WebP</span>
                    <span>•</span>
                    <span>Max 10MB</span>
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
          accept="image/*"
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
            {value ? 'Change Image' : 'Select Image'}
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Browse Library
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {value && (
              <img
                src={value}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}