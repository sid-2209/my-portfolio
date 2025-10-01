"use client";

import { useState, useEffect } from "react";
import {
  X,
  Edit3,
  Save,
  Trash2,
  Download,
  Image as ImageIcon,
  File,
  Calendar,
  FolderOpen,
  User,
  HardDrive,
  Tag
} from "lucide-react";

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
  updatedAt: string;
  folder?: string | null;
  source: string;
  uploadedBy: string;
  contentId?: string | null;
  blockId?: string | null;
  width?: number | null;
  height?: number | null;
}

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem | null;
  onUpdate: (updatedMedia: MediaItem) => void;
  onDelete: (mediaId: string) => void;
}

export default function MediaDetailModal({
  isOpen,
  onClose,
  media,
  onUpdate,
  onDelete
}: MediaDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    altText: '',
    caption: '',
    folder: ''
  });

  useEffect(() => {
    if (media) {
      setFormData({
        altText: media.altText || '',
        caption: media.caption || '',
        folder: media.folder || 'general'
      });
    }
  }, [media]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = async () => {
    if (!media) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          altText: formData.altText || null,
          caption: formData.caption || null,
          folder: formData.folder
        }),
      });

      if (response.ok) {
        const updatedMedia = await response.json();
        onUpdate(updatedMedia);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update media');
      }
    } catch (error) {
      console.error('Error updating media:', error);
      alert('Failed to update media');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!media) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${media.filename}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete(media.id);
        onClose();
      } else {
        const error = await response.json();
        if (error.inUse) {
          alert('Cannot delete media that is currently being used in content. Please remove it from content first.');
        } else {
          alert(error.error || 'Failed to delete media');
        }
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = () => {
    if (!media) return;

    const link = document.createElement('a');
    link.href = media.blobUrl;
    link.download = media.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCancel = () => {
    if (media) {
      setFormData({
        altText: media.altText || '',
        caption: media.caption || '',
        folder: media.folder || 'general'
      });
    }
    setIsEditing(false);
  };

  if (!isOpen || !media) return null;

  const isImage = media.mimetype.startsWith('image/');
  const isVideo = media.mimetype.startsWith('video/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Media Details</h3>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit metadata"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Media Preview */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {isImage ? (
                  <img
                    src={media.blobUrl}
                    alt={media.altText || media.filename}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : isVideo ? (
                  <video
                    src={media.blobUrl}
                    controls
                    className="max-w-full max-h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="text-center">
                    <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{media.filename}</p>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900">File Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Original Name</p>
                    <p className="font-medium text-gray-900">{media.originalName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">File Size</p>
                    <p className="font-medium text-gray-900">{formatFileSize(media.size)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">MIME Type</p>
                    <p className="font-medium text-gray-900">{media.mimetype}</p>
                  </div>
                  {(media.width && media.height) && (
                    <div>
                      <p className="text-gray-600">Dimensions</p>
                      <p className="font-medium text-gray-900">{media.width} × {media.height}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-6">
              {/* Basic Metadata */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Metadata</h4>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={formData.altText}
                        onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
                        placeholder="Describe this image for accessibility"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Used for screen readers and SEO
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Caption
                      </label>
                      <textarea
                        value={formData.caption}
                        onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                        placeholder="Optional caption or description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Folder
                      </label>
                      <select
                        value={formData.folder}
                        onChange={(e) => setFormData(prev => ({ ...prev, folder: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="general">General</option>
                        <option value="content">Content</option>
                        <option value="blocks">Content Blocks</option>
                        <option value="featured">Featured Images</option>
                        <option value="thumbnails">Thumbnails</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Alt Text</p>
                      <p className="text-gray-900">{media.altText || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Caption</p>
                      <p className="text-gray-900">{media.caption || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Folder</p>
                      <p className="text-gray-900 capitalize">{media.folder || 'general'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* System Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">System Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Uploaded by</p>
                      <p className="text-gray-900">{media.uploadedBy}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FolderOpen className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Source</p>
                      <p className="text-gray-900 capitalize">{media.source.replace('-', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Created</p>
                      <p className="text-gray-900">{new Date(media.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {media.updatedAt !== media.createdAt && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Last updated</p>
                        <p className="text-gray-900">{new Date(media.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  {(media.contentId || media.blockId) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm font-medium">Currently in use</p>
                      <p className="text-yellow-700 text-xs">
                        This media is being used in content and cannot be deleted.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}