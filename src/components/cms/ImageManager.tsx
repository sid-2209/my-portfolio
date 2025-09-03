"use client";

import { useState, useEffect } from "react";

interface ImageManagerProps {
  onImageSelect: (imageData: { src: string; alt: string; caption?: string }) => void;
  onClose: () => void;
  className?: string;
}

interface ImageData {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  size: number;
  uploadedAt: Date;
}

export default function ImageManager({ onImageSelect, onClose, className = "" }: ImageManagerProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load sample images for demo
    setImages([
      {
        id: '1',
        src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500',
        alt: 'Code on screen',
        caption: 'Programming workspace',
        size: 1024000,
        uploadedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
        alt: 'Modern office',
        caption: 'Modern workspace',
        size: 2048000,
        uploadedAt: new Date('2024-01-14')
      },
      {
        id: '3',
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        alt: 'Technology concept',
        caption: 'Digital innovation',
        size: 1536000,
        uploadedAt: new Date('2024-01-13')
      }
    ]);
  }, []);

  const handleImageUpload = () => {
    if (imageUrl.trim()) {
      const newImage: ImageData = {
        id: Date.now().toString(),
        src: imageUrl,
        alt: altText || 'Uploaded image',
        caption: caption || '',
        size: 0,
        uploadedAt: new Date()
      };
      
      setImages(prev => [newImage, ...prev]);
      setImageUrl('');
      setAltText('');
      setCaption('');
    }
  };

  const handleImageSelect = () => {
    if (selectedImage) {
      onImageSelect({
        src: selectedImage.src,
        alt: selectedImage.alt,
        caption: selectedImage.caption
      });
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!mounted) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Image Manager</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Add New Image</h4>
              
              {/* Upload Mode Toggle */}
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={() => setUploadMode('url')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    uploadMode === 'url' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  URL
                </button>
                <button
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    uploadMode === 'file' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  File
                </button>
              </div>

              {uploadMode === 'url' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Describe the image"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      placeholder="Image caption"
                    />
                  </div>
                  <button
                    onClick={handleImageUpload}
                    disabled={!imageUrl.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Image
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600 mb-2">Drag and drop images here</p>
                  <p className="text-xs text-gray-500">or</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Browse files
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Supports: JPG, PNG, GIF, WebP (max 10MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Image Library</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search images..."
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
                <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <option>All</option>
                  <option>Recent</option>
                  <option>Large</option>
                  <option>Small</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage?.id === image.id 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    {selectedImage?.id === image.id && (
                      <div className="bg-blue-600 text-white rounded-full p-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs text-gray-600 truncate">{image.alt}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(image.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Image Details */}
        {selectedImage && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">{selectedImage.alt}</h5>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedImage.size)} • {selectedImage.uploadedAt.toLocaleDateString()}
                </p>
                {selectedImage.caption && (
                  <p className="text-sm text-gray-500 mt-1">{selectedImage.caption}</p>
                )}
              </div>
              <button
                onClick={handleImageSelect}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Use This Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
