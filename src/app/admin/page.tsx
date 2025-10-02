"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DragDropBlockBuilder from "../../components/cms/DragDropBlockBuilder";
import EnhancedContentEditor from "../../components/cms/EnhancedContentEditor";
import EnhancedContentAnalytics from "../../components/cms/EnhancedContentAnalytics";
import LivePreviewPanel from "../../components/cms/LivePreviewPanel";
import RevisionHistoryPanel from "../../components/cms/RevisionHistoryPanel";
import TemplateManager from "../../components/cms/TemplateManager";
import SortableContentGrid from "../../components/cms/SortableContentGrid";
import { useLivePreview } from "../../hooks/useLivePreview";
import { useRevisionHistory } from "../../hooks/useRevisionHistory";
import { BlockType } from "@prisma/client";
import { StatCard, EmptyState, ContentCard } from "../../components/data-display";
import { LoadingSpinner } from "../../components/feedback";
import { SearchAndFilterBar } from "../../components/navigation";
import ConfirmFeaturedReplaceModal from "../../components/modals/ConfirmFeaturedReplaceModal";
import ConfirmDeleteModal from "../../components/modals/ConfirmDeleteModal";

// Import the same interfaces used in BlockEditor for consistency
interface ParagraphData {
  text: string;
}

interface HeadingData {
  text: string;
  level: number;
}

interface ImageData {
  src: string;
  alt: string;
  caption?: string;
}

interface CodeBlockData {
  code: string;
  language: string;
}

interface QuoteData {
  text: string;
  author?: string;
  source?: string;
}

interface ListData {
  type: 'unordered' | 'ordered';
  items: string[];
}

interface DividerData {
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
}

interface CustomData {
  html: string;
}

// Union type for all possible block data
type BlockData = 
  | ParagraphData 
  | HeadingData 
  | ImageData 
  | CodeBlockData 
  | QuoteData 
  | ListData 
  | DividerData 
  | CustomData;



interface Content {
  id: string;
  title: string;
  description?: string | null;
  contentType: string;
  category?: string | null;
  featured: boolean;
  posterImage?: string | null;
  imageUrl?: string | null;
  contentUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status?: string;
  slug?: string;
  contentBlocks?: { id: string; blockType: string; data: unknown; order: number }[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishDate?: string;
  readingTime?: number;
}

export default function AdminPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'content' | 'analytics' | 'templates'>('overview');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    featured: false,
    status: 'DRAFT',
    contentType: '',
    category: '',
    author: '',
    imageUrl: '',
    contentUrl: '',
    tags: [] as string[]
  });

  // Featured content modal state
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [featuredModalData, setFeaturedModalData] = useState<{
    newContentId: string;
    newContentTitle: string;
    currentFeatured: {
      id: string;
      title: string;
      description?: string | null;
      contentType: string;
    } | null;
  } | null>(null);
  const [isFeaturedReplacing, setIsFeaturedReplacing] = useState(false);

  // Delete content modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<{
    id: string;
    title: string;
    description?: string | null;
    contentType: string;
    status?: string;
    featured: boolean;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    contentType: 'blog',
    category: '',
    imageUrl: '',
    contentUrl: '',
    tags: [],
    featured: false,
    status: 'DRAFT',
    slug: '',
    author: 'Sid',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    publishDate: '',
    readingTime: 0
  });

  // Filtering and Search State
  const [searchQuery, setSearchQuery] = useState('');

  const [filterContentType, setFilterContentType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Live Preview System
  const currentContent = useMemo(() =>
    selectedContentId ? content.find(c => c.id === selectedContentId) : null,
    [selectedContentId, content]
  );

  const initialBlocks = useMemo(() =>
    currentContent?.contentBlocks?.map(block => ({
      id: block.id,
      blockType: block.blockType,
      data: block.data,
      order: block.order
    })) || [],
    [currentContent?.contentBlocks]
  );

  const initialMetadata = useMemo(() => ({
    title: currentContent?.title || '',
    description: currentContent?.description || '',
    contentType: currentContent?.contentType || '',
    status: currentContent?.status || ''
  }), [currentContent?.title, currentContent?.description, currentContent?.contentType, currentContent?.status]);

  const {
    isPreviewVisible,
    previewBlocks,
    contentMetadata,
    updatePreviewBlocks,
    updateContentMetadata,
    togglePreviewVisibility,
  } = useLivePreview(initialBlocks, initialMetadata);

  // Revision History System
  const [isRevisionHistoryVisible, setIsRevisionHistoryVisible] = useState(false);
  const { createAutoRevision } = useRevisionHistory();

  const toggleRevisionHistory = () => {
    setIsRevisionHistoryVisible(!isRevisionHistoryVisible);
  };

  // Filtering and Search Logic
  const filteredContent = useMemo(() => {
    let filtered = content;

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        // Search within content blocks
        (item.contentBlocks && item.contentBlocks.some(block => {
          if (block.data && typeof block.data === 'object') {
            const blockData = block.data as Record<string, unknown>;
            // Search in text content
            if (blockData.text && typeof blockData.text === 'string') {
              return blockData.text.toLowerCase().includes(query);
            }
            // Search in code content
            if (blockData.code && typeof blockData.code === 'string') {
              return blockData.code.toLowerCase().includes(query);
            }
            // Search in HTML content
            if (blockData.html && typeof blockData.html === 'string') {
              return blockData.html.toLowerCase().includes(query);
            }
          }
          return false;
        }))
      );
    }

    // Content type filtering
    if (filterContentType) {
      filtered = filtered.filter(item => item.contentType === filterContentType);
    }

    // Status filtering
    if (filterStatus) {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Featured filtering
    if (filterFeatured !== '') {
      const isFeatured = filterFeatured === 'true';
      filtered = filtered.filter(item => item.featured === isFeatured);
    }

    // Date range filtering
    if (filterDateRange) {
      const now = new Date();
      const itemDate = new Date();
      
      switch (filterDateRange) {
        case 'today':
          filtered = filtered.filter(item => {
            itemDate.setTime(new Date(item.createdAt).getTime());
            return itemDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(item => new Date(item.createdAt) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(item => new Date(item.createdAt) >= monthAgo);
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(item => new Date(item.createdAt) >= quarterAgo);
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(item => new Date(item.createdAt) >= yearAgo);
          break;
      }
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'status':
        filtered.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
        break;
      case 'type':
        filtered.sort((a, b) => a.contentType.localeCompare(b.contentType));
        break;
    }

    return filtered;
  }, [content, searchQuery, filterContentType, filterStatus, filterFeatured, filterDateRange, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterContentType('');
    setFilterStatus('');
    setFilterFeatured('');
    setFilterDateRange('');
    setSortBy('newest');
  };







  const fetchAllContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content');
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (contentId: string, currentFeatured: boolean) => {
    console.log('🔄 toggleFeatured called:', { contentId, currentFeatured });

    try {
      setIsUpdating(true);

      // If unfeaturing, just proceed directly
      if (currentFeatured) {
        console.log('📤 Unfeaturing content:', contentId);
        const response = await fetch(`/api/content/${contentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ featured: false }),
        });

        if (!response.ok) {
          throw new Error('Failed to update featured status');
        }

        setContent(prev => prev.map(item =>
          item.id === contentId
            ? { ...item, featured: false }
            : item
        ));
        setIsUpdating(false);
        return;
      }

      // If featuring, check for conflicts
      console.log('⭐ Attempting to feature content:', contentId);
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: true }),
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 409) {
        console.log('⚠️ Conflict detected (409), parsing response...');

        try {
          const errorData = await response.json();
          console.log('📄 Conflict response data:', errorData);

          if (errorData.requiresConfirmation && errorData.currentFeatured) {
            const currentContent = content.find(item => item.id === contentId);
            console.log('🎯 Current content for modal:', currentContent?.title);

            const modalData = {
              newContentId: contentId,
              newContentTitle: currentContent?.title || 'Unknown',
              currentFeatured: errorData.currentFeatured
            };

            console.log('🪟 Setting modal data:', modalData);
            setFeaturedModalData(modalData);
            setShowFeaturedModal(true);
            console.log('✅ Modal should now be visible');

            // Don't call setIsUpdating(false) here - keep it loading until modal is handled
            return;
          } else {
            console.log('❌ Missing requiresConfirmation or currentFeatured in response');
            throw new Error('Invalid conflict response format');
          }
        } catch (jsonError) {
          console.error('❌ Failed to parse 409 response JSON:', jsonError);
          throw new Error('Failed to handle conflict response');
        }
      }

      if (!response.ok) {
        console.log('❌ Response not OK, status:', response.status);
        let errorData: { error?: string } = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response JSON:', parseError);
        }
        throw new Error(errorData.error || 'Failed to update featured status');
      }

      console.log('✅ Successfully featured content');
      // Success: update the content
      setContent(prev => prev.map(item =>
        item.id === contentId
          ? { ...item, featured: true }
          : item
      ));
      setIsUpdating(false);

    } catch (error) {
      console.error('❌ Error in toggleFeatured:', error);
      setIsUpdating(false);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update featured status'}`);
    }
  };

  const handleFeaturedReplace = async () => {
    if (!featuredModalData) return;

    try {
      setIsFeaturedReplacing(true);

      const response = await fetch('/api/content/featured/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldId: featuredModalData.currentFeatured?.id,
          newId: featuredModalData.newContentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to replace featured content');
      }

      // Update content state: unfeature old, feature new
      setContent(prev => prev.map(item => {
        if (item.id === featuredModalData.currentFeatured?.id) {
          return { ...item, featured: false };
        }
        if (item.id === featuredModalData.newContentId) {
          return { ...item, featured: true };
        }
        return item;
      }));

      setShowFeaturedModal(false);
      setFeaturedModalData(null);
    } catch (error) {
      console.error('Error replacing featured content:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to replace featured content'}`);
    } finally {
      setIsFeaturedReplacing(false);
    }
  };

  const handleFeaturedModalClose = () => {
    if (isFeaturedReplacing) return; // Prevent closing during replacement
    console.log('🪟 Closing featured modal');
    setShowFeaturedModal(false);
    setFeaturedModalData(null);
    setIsUpdating(false); // Reset loading state when modal is closed
  };

  const handleRemoveContent = (contentItem: Content) => {
    setDeleteModalData({
      id: contentItem.id,
      title: contentItem.title,
      description: contentItem.description,
      contentType: contentItem.contentType,
      status: contentItem.status,
      featured: contentItem.featured
    });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalData) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/content/${deleteModalData.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete content');
      }

      // Remove content from state
      setContent(prev => prev.filter(item => item.id !== deleteModalData.id));

      // Close modal
      setShowDeleteModal(false);
      setDeleteModalData(null);

    } catch (error) {
      console.error('Error deleting content:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete content'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteModalClose = () => {
    if (isDeleting) return; // Prevent closing during deletion
    setShowDeleteModal(false);
    setDeleteModalData(null);
  };

  const handleContentReorder = (reorderedContent: Content[]) => {
    setContent(reorderedContent);
    // Optionally, you could save the new order to the backend here
    // For now, we'll just update the local state
  };



  const startEditing = (post: Content) => {
    setEditingId(post.id);
    setEditForm({
      title: post.title,
      description: post.description || '',
      featured: post.featured,
      status: post.status || 'DRAFT',
      contentType: post.contentType,
      category: post.category || '',
      author: post.author,
      imageUrl: post.imageUrl || '',
      contentUrl: post.contentUrl || '',
      tags: post.tags || ([] as string[])
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      setIsUpdating(true);
      console.log('💾 Saving edit for content:', editingId, 'with data:', editForm);

      const response = await fetch(`/api/content/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      console.log('📡 Save response status:', response.status);

      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        try {
          errorData = await response.json();
          console.log('❌ Save error response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }

        // Check if this is a featured content conflict
        if (response.status === 409 && (errorData as { requiresConfirmation?: boolean }).requiresConfirmation) {
          console.log('⚠️ Featured content conflict during edit');
          const currentContent = content.find(item => item.id === editingId);
          setFeaturedModalData({
            newContentId: editingId,
            newContentTitle: currentContent?.title || 'Unknown',
            currentFeatured: (errorData as { currentFeatured?: { id: string; title: string; description?: string | null; contentType: string } | null }).currentFeatured || null
          });
          setShowFeaturedModal(true);
          return; // Don't call setIsUpdating(false) here
        }

        throw new Error((errorData as { error?: string }).error || `Failed to update post (${response.status})`);
      }

      const updatedPost = await response.json();
      console.log('✅ Successfully updated post');
      setContent(prev => prev.map(item =>
        item.id === editingId ? updatedPost : item
      ));
      setEditingId(null);
      setIsUpdating(false);
    } catch (error) {
      console.error('❌ Error updating post:', error);
      setIsUpdating(false);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to update post'}`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      title: '',
      description: '',
      featured: false,
      status: 'DRAFT',
      contentType: '',
      category: '',
      author: '',
      imageUrl: '',
      contentUrl: '',
      tags: [] as string[]
    });
  };

  const handleContentBlocksChange = async (blocks: { id: string; blockType: string; data: unknown; order: number }[]) => {
    if (!selectedContentId) {
      console.error('No content selected for block update');
      return;
    }

    try {
      console.log('Updating content blocks for:', selectedContentId, 'with', blocks.length, 'blocks');

      const response = await fetch(`/api/content/${selectedContentId}/blocks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update content blocks (${response.status})`);
      }

      const updatedBlocks = await response.json();
      console.log('Successfully updated blocks:', updatedBlocks.length, 'blocks saved');

      setContent(prev => prev.map(item =>
        item.id === selectedContentId
          ? { ...item, contentBlocks: updatedBlocks }
          : item
      ));

      // Update live preview with the new blocks
      const previewBlocks = updatedBlocks.map((block: { id: string; blockType: string; data: unknown; order: number }) => ({
        id: block.id,
        blockType: block.blockType,
        data: block.data,
        order: block.order
      }));
      updatePreviewBlocks(previewBlocks);

      // Create auto-revision for content block changes
      await createAutoRevision(selectedContentId);
    } catch (error) {
      console.error('Error updating content blocks:', error);
      alert(`Error saving blocks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEnhancedSave = async (updatedContent: Content) => {
    try {
      setIsUpdating(true);

      // Check if this is a new content item (ID starts with "new-")
      const isNewContent = updatedContent.id.startsWith('new-');

      let response;
      let savedContent: Content;

      if (isNewContent) {
        // Create new content via POST
        const { id, createdAt, updatedAt, ...contentData } = updatedContent;
        response = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contentData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create content');
        }

        savedContent = await response.json();

        // Add new content to the list
        setContent(prev => [savedContent, ...prev]);
      } else {
        // Update existing content via PATCH
        response = await fetch(`/api/content/${updatedContent.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedContent),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update content');
        }

        savedContent = await response.json();

        // Update existing content in the list
        setContent(prev => prev.map(item =>
          item.id === updatedContent.id ? savedContent : item
        ));
      }

      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving content:', error);
      // You might want to show this error to the user in a toast or alert
      alert(`Error saving content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAllContent();
  }, []);

  const featuredContent = content.filter(item => item.featured);

  const totalContent = content.length;
  const publishedContent = content.filter(item => item.status === 'PUBLISHED').length;
  const draftContent = content.filter(item => item.status === 'DRAFT').length;

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
  return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <span>Dashboard</span>
        {activeView !== 'overview' && (
          <>
            <span>/</span>
            <button 
              onClick={() => setActiveView('overview')}
              className="text-gray-700 hover:text-gray-900"
            >
              {activeView === 'content' ? 'Content' : activeView === 'analytics' ? 'Analytics' : 'Templates'}
            </button>
          </>
        )}
      </nav>

      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeView === 'overview' ? 'Content Manager' :
               activeView === 'content' ? 'Content Editor' :
               activeView === 'analytics' ? 'Content Analytics' : 'Templates & Snippets'}
              </h1>
            <p className="text-gray-600">
              {activeView === 'overview' ? 'Manage content, toggle featured posts, and edit content blocks' :
               activeView === 'content' ? 'Create and edit content with advanced features' :
               activeView === 'analytics' ? 'Track content performance and insights' :
               'Manage content templates and reusable snippets'}
              </p>
            </div>
          <div className="flex items-center space-x-3">
              {activeView === 'overview' && (
                <button
                  onClick={() => setActiveView('analytics')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analytics
                </button>
              )}
              {activeView === 'overview' && (
                <button
                  onClick={() => setActiveView('templates')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Templates
                </button>
              )}
            {activeView === 'overview' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Post
              </button>
            )}
            {activeView !== 'overview' && (
              <button
                onClick={() => setActiveView('overview')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Overview
              </button>
            )}
          </div>
        </div>
          </div>
          
      {/* Enhanced Content Editor */}
              {showAddForm && (
        <div className="mb-8">
          <EnhancedContentEditor
            content={{
              id: `new-${Date.now()}`,
              title: newPost.title,
              description: newPost.description,
              contentType: newPost.contentType,
              category: newPost.category,
              featured: newPost.featured,
              imageUrl: newPost.imageUrl,
              contentUrl: newPost.contentUrl,
              publishedDate: new Date().toISOString(),
              author: newPost.author,
              tags: newPost.tags,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: newPost.status,
              slug: newPost.slug,
              contentBlocks: [],
              seoTitle: newPost.seoTitle,
              seoDescription: newPost.seoDescription,
              seoKeywords: newPost.seoKeywords,
              publishDate: newPost.publishDate,
              readingTime: newPost.readingTime
            }}
            onSave={handleEnhancedSave}
            onCancel={() => setShowAddForm(false)}
            isEditing={false}
          />
        </div>
      )}

      {/* Content Analytics View */}
      {activeView === 'analytics' && (
        <EnhancedContentAnalytics content={content.map(item => ({
          id: item.id,
          title: item.title,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          status: item.status || 'DRAFT',
          featured: item.featured,
          contentType: item.contentType,
          category: item.category || undefined,
          readingTime: item.readingTime,
          publishedDate: item.publishedDate,
          description: item.description || undefined,
          tags: item.tags,
          contentBlocks: item.contentBlocks
        }))} />
      )}

      {/* Templates & Snippets View */}
      {activeView === 'templates' && (
        <div className="max-w-full">
          <TemplateManager />
        </div>
      )}

      {/* Content Overview */}
      {activeView === 'overview' && (
        <>
          {/* Advanced Search and Filtering */}
          <SearchAndFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterContentType={filterContentType}
            onFilterContentTypeChange={setFilterContentType}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterFeatured={filterFeatured}
            onFilterFeaturedChange={setFilterFeatured}
            filterDateRange={filterDateRange}
            onFilterDateRangeChange={setFilterDateRange}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            onClearFilters={clearFilters}
            totalResults={filteredContent.length}
          />











          {/* Search Results */}
          {(searchQuery || filterContentType || filterStatus || filterFeatured || filterDateRange) && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                <span className="text-sm text-gray-500">
                  {filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''} found
                </span>
              </div>
              
                            {filteredContent.length > 0 ? (
                <SortableContentGrid
                  content={filteredContent as Content[]}
                  onContentReorder={handleContentReorder}
                  editingId={editingId}
                  editForm={editForm}
                  onEditFormChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
                  onStartEditing={startEditing}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onToggleFeatured={(id, currentFeatured) => !isUpdating && toggleFeatured(id, currentFeatured)}
                  onOpenBlocks={(id) => setSelectedContentId(id)}
                  onRemove={handleRemoveContent}
                  isUpdating={isUpdating}
                  searchQuery={searchQuery}
                />
              ) : (
                <EmptyState
                  title="No Results Found"
                  description="Try adjusting your search terms or filters."
                  icon={
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  actionText="Clear All Filters"
                  onAction={clearFilters}
                />
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Content"
              value={totalContent}
              icon={
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              }
            />
            
            <StatCard
              label="Published"
              value={publishedContent}
              icon={
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <StatCard
              label="Drafts"
              value={draftContent}
              icon={
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            
            <StatCard
              label="Featured"
              value={featuredContent.length}
              icon={
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
            />
          </div>

          {/* Loading State */}
          {isLoading ? (
            <LoadingSpinner variant="default" />
          ) : (
            <>
              {/* Content Blocks Editor */}
              {selectedContentId && (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Content Blocks</h2>
                      <p className="text-gray-600">
                        {content.find(c => c.id === selectedContentId)?.title}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePreviewVisibility}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isPreviewVisible
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
                      </button>
                      <button
                        onClick={toggleRevisionHistory}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isRevisionHistoryVisible
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15L12 11L16 15" />
                        </svg>
                        {isRevisionHistoryVisible ? 'Hide History' : 'Show History'}
                      </button>
                      <button
                        onClick={() => setSelectedContentId(null)}
                        className="text-gray-600 hover:text-gray-800 font-medium flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Overview</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="flex-1">
                      <DragDropBlockBuilder
                        contentId={selectedContentId}
                        initialBlocks={(content.find(c => c.id === selectedContentId)?.contentBlocks || []).map(block => ({
                          ...block,
                          contentId: selectedContentId,
                          blockType: block.blockType as BlockType,
                          data: block.data as BlockData,
                          createdAt: new Date(),
                          updatedAt: new Date()
                        }))}
                        onBlocksChange={handleContentBlocksChange}
                      />
                    </div>

                    {/* Live Preview Panel */}
                    <LivePreviewPanel
                      blocks={previewBlocks}
                      contentTitle={contentMetadata.title}
                      contentDescription={contentMetadata.description}
                      isVisible={isPreviewVisible}
                      onToggleVisibility={togglePreviewVisibility}
                    />
                  </div>
                </div>
              )}

              {/* Content Overview */}
              {!selectedContentId && (
                <div className="space-y-8">
                  {/* Featured Content Section */}
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gray-800 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">Featured Content</h2>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {filteredContent.filter((item: any) => item.featured).length} posts
                      </span>
                    </div>
                    <SortableContentGrid
                      content={filteredContent.filter((item: any) => item.featured)}
                      onContentReorder={handleContentReorder}
                      editingId={editingId}
                      editForm={editForm}
                      onEditFormChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
                      onStartEditing={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onToggleFeatured={(id, currentFeatured) => !isUpdating && toggleFeatured(id, currentFeatured)}
                      onOpenBlocks={(id) => setSelectedContentId(id)}
                      onRemove={handleRemoveContent}
                      isUpdating={isUpdating}
                      searchQuery={searchQuery}
                    />
                    {filteredContent.filter((item: any) => item.featured).length === 0 && (
                      <EmptyState
                        title="No Featured Content Yet"
                        description="Start by creating content and marking it as featured to showcase your best work."
                        icon={
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        }
                        actionText="+ Create Content"
                        onAction={() => setShowAddForm(true)}
                      />
                    )}
                  </div>

                  {/* Non-Featured Content Section */}
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-gray-800 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-900">All Content</h2>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">
                        {filteredContent.filter((item: any) => !item.featured).length} posts
                      </span>
                    </div>
                    <SortableContentGrid
                      content={filteredContent.filter((item: any) => !item.featured)}
                      onContentReorder={handleContentReorder}
                      editingId={editingId}
                      editForm={editForm}
                      onEditFormChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
                      onStartEditing={startEditing}
                      onSaveEdit={saveEdit}
                      onCancelEdit={() => setEditingId(null)}
                      onToggleFeatured={(id, currentFeatured) => !isUpdating && toggleFeatured(id, currentFeatured)}
                      onOpenBlocks={(id) => setSelectedContentId(id)}
                      onRemove={handleRemoveContent}
                      isUpdating={isUpdating}
                      searchQuery={searchQuery}
                    />
                    {filteredContent.filter((item: any) => !item.featured).length === 0 && (
                      <EmptyState
                        title="No Content Yet"
                        description="Create your first piece of content to get started with your portfolio."
                        icon={
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        }
                        actionText="+ Create Content"
                        onAction={() => setShowAddForm(true)}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
              )}
            </>
          )}

      {/* Featured Content Replacement Modal */}
      <ConfirmFeaturedReplaceModal
        isOpen={showFeaturedModal}
        onClose={handleFeaturedModalClose}
        onConfirm={handleFeaturedReplace}
        currentFeatured={featuredModalData?.currentFeatured ? {
          ...featuredModalData.currentFeatured,
          description: featuredModalData.currentFeatured.description || ''
        } : null}
        newContentTitle={featuredModalData?.newContentTitle || ''}
        isLoading={isFeaturedReplacing}
      />

      {/* Delete Content Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        content={deleteModalData}
        isLoading={isDeleting}
      />

      {/* Revision History Panel */}
      {selectedContentId && (
        <RevisionHistoryPanel
          contentId={selectedContentId}
          isVisible={isRevisionHistoryVisible}
          onToggleVisibility={toggleRevisionHistory}
          onRestoreRevision={() => {
            // Refresh content when a revision is restored
            fetchAllContent();
          }}
        />
      )}

    </div>
  );
}
