"use client";

import { useState, useEffect } from "react";
import BlockBuilder from "../../components/cms/BlockBuilder";
import EnhancedContentEditor from "../../components/cms/EnhancedContentEditor";
import ContentAnalytics from "../../components/cms/ContentAnalytics";
import { BlockType } from "@prisma/client";

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

// Extended ContentBlock interface with proper typing
interface TypedContentBlock {
  id: string;
  contentId: string;
  blockType: string;
  order: number;
  data: BlockData;
  createdAt: Date;
  updatedAt: Date;
}

interface Content {
  id: string;
  title: string;
  description: string;
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
  const [activeView, setActiveView] = useState<'overview' | 'content' | 'analytics'>('overview');
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    featured: false,
    status: 'DRAFT'
  });
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    contentType: 'blog',
    category: '',
    imageUrl: '',
    contentUrl: '',
    tags: '',
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
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }
      
      setContent(prev => prev.map(item => 
        item.id === contentId 
          ? { ...item, featured: !currentFeatured }
          : item
      ));
    } catch (error) {
      console.error('Error updating featured status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const addNewPost = async () => {
    try {
      setIsUpdating(true);
      
      const slug = newPost.slug || newPost.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPost,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          author: 'Sid',
          slug
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      const createdPost = await response.json();
      setContent(prev => [createdPost, ...prev]);
      setNewPost({
        title: '',
        description: '',
        contentType: 'blog',
        category: '',
        imageUrl: '',
        contentUrl: '',
        tags: '',
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
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = (post: Content) => {
    setEditingId(post.id);
    setEditForm({
      title: post.title,
      description: post.description,
      featured: post.featured,
      status: post.status || 'DRAFT'
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/content/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      const updatedPost = await response.json();
      setContent(prev => prev.map(item => 
        item.id === editingId ? updatedPost : item
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', featured: false, status: 'DRAFT' });
  };

  const handleContentBlocksChange = async (blocks: { id: string; blockType: string; data: unknown; order: number }[]) => {
    if (!selectedContentId) return;
    
    try {
      const response = await fetch(`/api/content/${selectedContentId}/blocks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update content blocks');
      }
      
      setContent(prev => prev.map(item => 
        item.id === selectedContentId 
          ? { ...item, contentBlocks: blocks }
          : item
      ));
    } catch (error) {
      console.error('Error updating content blocks:', error);
    }
  };

  const handleEnhancedSave = async (updatedContent: Content) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/content/${updatedContent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContent),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update content');
      }
      
      const savedContent = await response.json();
      setContent(prev => prev.map(item => 
        item.id === updatedContent.id ? savedContent : item
      ));
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAllContent();
  }, []);

  const featuredContent = content.filter(item => item.featured);
  const nonFeaturedContent = content.filter(item => !item.featured);
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
              className="text-blue-600 hover:text-blue-700"
            >
              {activeView === 'content' ? 'Content' : 'Analytics'}
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
               activeView === 'content' ? 'Content Editor' : 'Content Analytics'}
            </h1>
            <p className="text-gray-600">
              {activeView === 'overview' ? 'Manage content, toggle featured posts, and edit content blocks' :
               activeView === 'content' ? 'Create and edit content with advanced features' :
               'Track content performance and insights'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {activeView === 'overview' && (
              <button
                onClick={() => setActiveView('analytics')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                📊 Analytics
              </button>
            )}
            {activeView === 'overview' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                + Add Post
              </button>
            )}
            {activeView !== 'overview' && (
              <button
                onClick={() => setActiveView('overview')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                ← Back to Overview
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
              tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
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
        <ContentAnalytics content={content.map(item => ({
          id: item.id,
          title: item.title,
          createdAt: item.createdAt,
          status: item.status || 'DRAFT',
          featured: item.featured
        }))} />
      )}

      {/* Content Overview */}
      {activeView === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Content</p>
                  <p className="text-2xl font-bold text-gray-900">{totalContent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{publishedContent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">{draftContent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">{featuredContent.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading content...</p>
            </div>
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
                  <BlockBuilder
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
              )}

              {/* Content Overview */}
              {!selectedContentId && (
                <div className="space-y-8">
                  {/* Featured Content Section */}
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">Featured Content</h2>
                      <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium text-sm">
                        {featuredContent.length} posts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredContent.map((item) => (
                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                          {editingId === item.id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                placeholder="Title"
                              />
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                                placeholder="Description"
                              />
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="ARCHIVED">Archived</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center text-xs">
                                  <input
                                    type="checkbox"
                                    checked={editForm.featured}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
                                    className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  Featured
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEdit}
                                  disabled={isUpdating}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-900 font-semibold truncate">{item.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                                    Featured
                                  </span>
                                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    item.status === 'PUBLISHED' ? 'text-blue-600 bg-blue-100' :
                                    item.status === 'DRAFT' ? 'text-yellow-600 bg-yellow-100' :
                                    'text-gray-600 bg-gray-100'
                                  }`}>
                                    {item.status || 'DRAFT'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  {item.contentType}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEditing(item)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setSelectedContentId(item.id)}
                                    className="text-green-600 hover:text-green-700 text-xs font-medium"
                                  >
                                    Blocks
                                  </button>
                                  <button
                                    onClick={() => !isUpdating && toggleFeatured(item.id, true)}
                                    disabled={isUpdating}
                                    className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Non-Featured Content Section */}
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">All Content</h2>
                      <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium text-sm">
                        {nonFeaturedContent.length} posts
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {nonFeaturedContent.map((item) => (
                        <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                          {editingId === item.id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                placeholder="Title"
                              />
                              <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                                placeholder="Description"
                              />
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="ARCHIVED">Archived</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center text-xs">
                                  <label className="flex items-center text-xs">
                                    <input
                                      type="checkbox"
                                      checked={editForm.featured}
                                      onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
                                      className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    Featured
                                  </label>
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEdit}
                                  disabled={isUpdating}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-900 font-semibold truncate">{item.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    {item.contentType}
                                  </span>
                                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    item.status === 'PUBLISHED' ? 'text-blue-600 bg-blue-100' :
                                    item.status === 'DRAFT' ? 'text-yellow-600 bg-yellow-100' :
                                    'text-gray-600 bg-gray-100'
                                  }`}>
                                    {item.status || 'DRAFT'}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {new Date(item.publishedDate).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEditing(item)}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setSelectedContentId(item.id)}
                                    className="text-green-600 hover:text-green-700 text-xs font-medium"
                                  >
                                    Blocks
                                  </button>
                                  <button
                                    onClick={() => !isUpdating && toggleFeatured(item.id, false)}
                                    disabled={isUpdating}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Feature
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
