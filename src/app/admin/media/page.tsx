"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Search,
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  Folder,
  HardDrive,
  Eye,
  Edit,
  Trash2,
  Filter,
  SortAsc,
  Plus,
  Download,
  Clock,
  FileText
} from "lucide-react";
import MediaUploadModal from "../../../components/media/MediaUploadModal";
import MediaDetailModal from "../../../components/media/MediaDetailModal";
import FolderManagementModal from "../../../components/media/FolderManagementModal";

interface MediaStats {
  overview: {
    totalFiles: number;
    totalSize: string;
    imageCount: number;
    videoCount: number;
    documentCount: number;
  };
  storage: {
    breakdown: {
      images: { count: number; size: number; percentage: number };
      videos: { count: number; size: number; percentage: number };
      documents: { count: number; size: number; percentage: number };
    };
    byFolder: Array<{ folder: string; count: number; size: string }>;
    bySource: Array<{ source: string; count: number; size: string }>;
  };
  recent: Array<{
    id: string;
    filename: string;
    size: number;
    formattedSize: string;
    createdAt: string;
    mimetype: string;
    isImage: boolean;
    blobUrl: string;
  }>;
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
  duration?: number | null;
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

interface MediaResponse {
  media: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function AdminMediaPage() {
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<MediaResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Image loading component with proper states
  const ImageWithLoader = ({ src, alt, className, onError }: {
    src: string;
    alt: string;
    className: string;
    onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    console.log('ImageWithLoader rendering:', { src, loading, error });

    const handleLoad = () => {
      console.log('Image loaded successfully:', src);
      setLoading(false);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      console.log('Image failed to load:', src, e);
      setLoading(false);
      setError(true);
      if (onError) onError(e);
    };

    if (error) {
      console.log('Rendering error state for:', src);
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50">
          <div className="text-center">
            <FileText className="w-8 h-8 text-red-400 mx-auto mb-1" />
            <span className="text-xs text-red-500">Failed to load</span>
          </div>
        </div>
      );
    }

    console.log('Rendering image with loading state:', loading);
    return (
      <>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          style={{
            opacity: loading ? 0 : 1,
            transition: 'opacity 0.3s ease',
            backgroundColor: loading ? 'transparent' : 'transparent'
          }}
        />
      </>
    );
  };

  useEffect(() => {
    fetchStats();
    fetchMedia();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchMedia();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filterType, currentPage, sortBy, sortOrder]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery, filterType]);


  const fetchStats = async () => {
    try {
      const response = await fetch('/api/media/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch media stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      setMediaLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchQuery,
        sortBy,
        sortOrder
      });

      if (filterType !== 'all') {
        params.append('mimetype', filterType);
      }

      const response = await fetch(`/api/media?${params}`);
      const data: MediaResponse = await response.json();

      console.log('Fetched media data:', data);
      console.log('Media items:', data.media);
      if (data.media && data.media.length > 0) {
        console.log('First media item blobUrl:', data.media[0].blobUrl);
      }

      setMedia(data.media);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setMediaLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUploadComplete = () => {
    // Refresh both stats and media data
    fetchStats();
    fetchMedia();
    setUploadModalOpen(false);
  };

  const handleViewMedia = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem);
    setDetailModalOpen(true);
  };

  const handleEditMedia = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem);
    setDetailModalOpen(true);
  };

  const handleDeleteMedia = async (mediaId: string) => {
    // Remove from local state immediately for better UX
    setMedia(prev => prev.filter(item => item.id !== mediaId));
    // Refresh data to ensure consistency
    fetchStats();
    fetchMedia();
  };

  const handleMediaUpdate = (updatedMedia: MediaItem) => {
    // Update local state
    setMedia(prev => prev.map(item =>
      item.id === updatedMedia.id ? updatedMedia : item
    ));
    setSelectedMedia(updatedMedia);
    // Refresh stats in case folder changed
    fetchStats();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
            <p className="text-lg text-gray-600 mt-2">Organize and manage your digital assets</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </button>
            <button
              onClick={() => setFolderModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Folder
            </button>
          </div>
        </div>

        {/* Media Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.imageCount || 0}</p>
                <p className="text-sm text-gray-600">Images</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.videoCount || 0}</p>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Folder className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.storage.byFolder.length || 0}</p>
                <p className="text-sm text-gray-600">Folders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalSize || '0 Bytes'}</p>
                <p className="text-sm text-gray-600">Storage Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search media files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>

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
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Media Library */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Media Library</h2>
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </button>
                    <button className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <SortAsc className="w-4 h-4 mr-2" />
                      Sort
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {mediaLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading media...</span>
                  </div>
                ) : media && media.length > 0 ? (
                  <>
                    <div className={viewMode === 'grid'
                      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                      : "space-y-3"
                    }>
                      {media.map((item) => (
                      <div
                        key={item.id}
                        className={viewMode === 'grid'
                          ? "group relative bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
                          : "flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        }
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden relative">
                              {item.mimetype.startsWith('image/') ? (
                                <img
                                  src={item.blobUrl}
                                  alt={item.altText || item.filename}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.mimetype.startsWith('video/') ? (
                                <div className="relative w-full h-full bg-gray-900">
                                  <video
                                    src={item.blobUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                  />
                                  {/* Duration overlay */}
                                  {item.duration && (
                                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                      {formatDuration(item.duration)}
                                    </div>
                                  )}
                                  {/* Video icon indicator */}
                                  <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    <span>Video</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                              )}

                              {/* Hover overlay with actions */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewMedia(item);
                                    }}
                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title="View details"
                                  >
                                    <Eye className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMedia(item);
                                    }}
                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title="Edit metadata"
                                  >
                                    <Edit className="w-4 h-4 text-gray-600" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMedia(item.id);
                                    }}
                                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-xs text-gray-600 truncate font-medium">{item.filename}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                              {item.mimetype.startsWith('image/') ? (
                                <img
                                  src={item.blobUrl}
                                  alt={item.altText || item.filename}
                                  className="w-full h-full object-cover"
                                />
                              ) : item.mimetype.startsWith('video/') ? (
                                <div className="relative w-full h-full bg-gray-900">
                                  <video
                                    src={item.blobUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <Video className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileText className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.filename}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(item.size)}
                                {item.duration && ` • ${formatDuration(item.duration)}`}
                                {' • '}{new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewMedia(item);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditMedia(item);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Edit metadata"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMedia(item.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={!pagination.hasPrev}
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>

                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                    pageNum === currentPage
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                            disabled={!pagination.hasNext}
                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No media files yet</h3>
                    <p className="text-gray-500 mb-6">Upload your first media file to get started</p>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Storage Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Images</span>
                    <span className="font-medium text-gray-900">{stats?.storage.breakdown.images.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats?.storage.breakdown.images.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Videos</span>
                    <span className="font-medium text-gray-900">{stats?.storage.breakdown.videos.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats?.storage.breakdown.videos.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Documents</span>
                    <span className="font-medium text-gray-900">{stats?.storage.breakdown.documents.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats?.storage.breakdown.documents.percentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="w-full flex items-center px-4 py-3 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Upload className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">Upload Files</p>
                    <p className="text-xs text-blue-600">Add new media</p>
                  </div>
                </button>

                <button
                  onClick={() => setFolderModalOpen(true)}
                  className="w-full flex items-center px-4 py-3 text-left bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Folder className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">Create Folder</p>
                    <p className="text-xs text-gray-600">Organize files</p>
                  </div>
                </button>

                <button className="w-full flex items-center px-4 py-3 text-left bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  <Download className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">Bulk Download</p>
                    <p className="text-xs text-gray-600">Export media</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            {stats?.recent && stats.recent.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {stats.recent.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{item.filename}</p>
                        <p className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <MediaUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        source="media-manager"
      />

      {/* Detail Modal */}
      <MediaDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        media={selectedMedia}
        onUpdate={handleMediaUpdate}
        onDelete={handleDeleteMedia}
      />

      {/* Folder Management Modal */}
      <FolderManagementModal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        onFolderCreated={() => {
          // Refresh data when folder is created
          fetchStats();
          fetchMedia();
        }}
      />
    </div>
  );
}