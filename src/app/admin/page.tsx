"use client";

import { useState, useEffect } from "react";

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
}

export default function AdminPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    featured: false
  });
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    contentType: 'blog',
    category: '',
    imageUrl: '',
    contentUrl: '',
    tags: '',
    featured: false
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
      
      // Update local state
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
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPost,
          tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          author: 'Sid'
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
        featured: false
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
      featured: post.featured
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
    setEditForm({ title: '', description: '', featured: false });
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  const featuredContent = content.filter(item => item.featured);
  const nonFeaturedContent = content.filter(item => !item.featured);

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-8 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-gray-900 text-3xl font-bold mb-2">
                Content Manager
              </h1>
              <p className="text-gray-700 text-sm font-medium">
                Toggle featured posts for homepage display
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {showAddForm ? 'Cancel' : '+ Add Post'}
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-gray-700 text-lg font-medium text-center py-8">Loading content...</div>
          ) : (
            <>
                            {/* Add New Post Form */}
              {showAddForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                  <h2 className="text-gray-900 text-2xl font-bold mb-6">
                    Add New Post
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-800 text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter post title"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 text-sm font-medium mb-2">Content Type</label>
                      <select
                        value={newPost.contentType}
                        onChange={(e) => setNewPost(prev => ({ ...prev, contentType: e.target.value }))}
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="blog">Blog</option>
                        <option value="project">Project</option>
                        <option value="case_study">Case Study</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-800 text-sm font-medium mb-2">Category</label>
                      <input
                        type="text"
                        value={newPost.category}
                        onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., AI & TECHNOLOGY"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 text-sm font-medium mb-2">Image URL</label>
                      <input
                        type="url"
                        value={newPost.imageUrl}
                        onChange={(e) => setNewPost(prev => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-800 text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={newPost.description}
                        onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
                        placeholder="Enter post description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-800 text-sm font-medium mb-2">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={newPost.tags}
                        onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="AI, Web Development, Technology"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-800 text-sm font-medium mb-2">Content URL</label>
                      <input
                        type="url"
                        value={newPost.contentUrl}
                        onChange={(e) => setNewPost(prev => ({ ...prev, contentUrl: e.target.value }))}
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="https://example.com/post"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newPost.featured}
                          onChange={(e) => setNewPost(prev => ({ ...prev, featured: e.target.checked }))}
                          className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-gray-700 text-sm">Featured on homepage</span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                                              <button
                          onClick={() => (!newPost.title || !newPost.description) ? null : addNewPost()}
                          disabled={!newPost.title || !newPost.description}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-sm"
                        >
                          Create Post
                        </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
              {/* Featured Content Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-900 text-2xl font-bold">
                    Featured Content
                  </h2>
                  <span className="text-gray-700 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {featuredContent.length} posts
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredContent.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                      {editingId === item.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm h-20 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Description"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={editForm.featured}
                                onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
                                className="mr-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              Featured
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              disabled={isUpdating}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-900 font-semibold truncate">{item.title}</h3>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              Featured
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.contentType}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditing(item)}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => !isUpdating && toggleFeatured(item.id, true)}
                                disabled={isUpdating}
                                className="text-red-600 hover:text-red-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-900 text-2xl font-bold">
                    All Content
                  </h2>
                  <span className="text-gray-700 text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                    {nonFeaturedContent.length} posts
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nonFeaturedContent.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                      {editingId === item.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Title"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full border border-gray-400 rounded px-2 py-1 text-sm h-20 text-gray-900 placeholder-gray-600 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Description"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center text-xs">
                              <input
                                type="checkbox"
                                checked={editForm.featured}
                                onChange={(e) => setEditForm(prev => ({ ...prev, featured: e.target.checked }))}
                                className="mr-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              Featured
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={saveEdit}
                              disabled={isUpdating}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-900 font-semibold truncate">{item.title}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.contentType}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {new Date(item.publishedDate).toLocaleDateString()}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditing(item)}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => !isUpdating && toggleFeatured(item.id, false)}
                                disabled={isUpdating}
                                className="text-blue-600 hover:text-blue-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
