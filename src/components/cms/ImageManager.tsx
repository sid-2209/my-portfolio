"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Search, X, Eye, Edit, Trash2, Grid3X3, List, Image as ImageIcon } from "lucide-react";

interface ImageManagerProps {
  onImageSelect: (imageData: { src: string; alt: string; caption?: string }) => void;
  onClose: () => void;
  className?: string;
  folder?: string;
  source?: string;
  contentId?: string;
  blockId?: string;
}

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
  formattedSize: string;
}

export default function ImageManager({
  onImageSelect,
  onClose,
  className = "",
  folder = "general",
  source = "general",
  contentId,
  blockId
}: ImageManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [searchQuery]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        mimetype: 'image',
        limit: '50'
      });

      const response = await fetch(`/api/media?${params}`);
      const data = await response.json();
      setMedia(data.media || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();

      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

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
        // Refresh media list
        await fetchMedia();

        // Auto-select first uploaded image
        if (result.uploaded[0]) {
          setSelectedMedia(result.uploaded[0]);
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleImageSelect = () => {
    if (selectedMedia) {
      onImageSelect({
        src: selectedMedia.blobUrl,
        alt: selectedMedia.altText || selectedMedia.filename,
        caption: selectedMedia.caption || undefined
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

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-2xl p-6 max-w-6xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Media Library</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
          {/* Upload Area */}
          <div className="lg:col-span-1">
            <div
              className={`h-full border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer ${
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
              onClick={uploading ? undefined : () => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center text-center h-full">
                {uploading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>

                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Drop files here
                    </h4>

                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse
                    </p>

                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Supports: JPG, PNG, GIF, WebP</p>
                      <p>Max size: 10MB each</p>
                      <p>Multiple files supported</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Media Library */}
          <div className="lg:col-span-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                {media.length} image{media.length !== 1 ? 's' : ''}
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : media.length > 0 ? (
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "space-y-3"
                }>
                  {media.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={`cursor-pointer rounded-lg transition-all duration-200 ${
                        selectedMedia?.id === item.id
                          ? 'ring-2 ring-blue-500 ring-offset-2'
                          : 'hover:shadow-lg'
                      } ${
                        viewMode === 'grid'
                          ? 'relative group bg-gray-50'
                          : 'flex items-center space-x-4 p-3 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={item.blobUrl}
                              alt={item.altText || item.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-gray-600 truncate font-medium">
                              {item.altText || item.filename}
                            </p>
                            <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                          </div>
                          {selectedMedia?.id === item.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.blobUrl}
                              alt={item.altText || item.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.altText || item.filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(item.size)} • {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {selectedMedia?.id === item.id && (
                            <div className="bg-blue-600 text-white rounded-full p-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'Upload your first image to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Image Details */}
        {selectedMedia && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedMedia.blobUrl}
                    alt={selectedMedia.altText || selectedMedia.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">
                    {selectedMedia.altText || selectedMedia.filename}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedMedia.size)} • {new Date(selectedMedia.createdAt).toLocaleDateString()}
                  </p>
                  {selectedMedia.caption && (
                    <p className="text-sm text-gray-500 mt-1">{selectedMedia.caption}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleImageSelect}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Use This Image
              </button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}