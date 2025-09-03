"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  category?: string | null;
  featured: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
  publishedDate: string;
  author: string;
  tags: string[];
}

interface ContentStats {
  totalPosts: number;
  published: number;
  drafts: number;
  featured: number;
  contentTypeBreakdown: Record<string, number>;
  recentActivity: Array<{
    id: string;
    action: string;
    title: string;
    status: string;
    timestamp: string;
    icon: string;
    color: string;
  }>;
}

export default function AdminContentPage() {
  const [mounted, setMounted] = useState(false);
  const [, setContent] = useState<Content[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    totalPosts: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    contentTypeBreakdown: {},
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch content data
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/content');
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      setContent(data);
      
      // Calculate real statistics
      const totalPosts = data.length;
      const published = data.filter((item: Content) => item.status === 'PUBLISHED').length;
      const drafts = data.filter((item: Content) => item.status === 'DRAFT').length;
      const featured = data.filter((item: Content) => item.featured).length;
      
      // Content type breakdown
      const contentTypeBreakdown = data.reduce((acc: Record<string, number>, item: Content) => {
        acc[item.contentType] = (acc[item.contentType] || 0) + 1;
        return acc;
      }, {});
      
      // Recent activity (last 5 items)
      const recentActivity = data
        .sort((a: Content, b: Content) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map((item: Content) => {
          const isNew = new Date(item.createdAt).getTime() > new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
          const isPublished = item.status === 'PUBLISHED';
          const isUpdated = new Date(item.updatedAt).getTime() > new Date(item.createdAt).getTime() + 1000;
          
          let action, icon, color;
          if (isNew) {
            action = 'New content created';
            icon = '📝';
            color = 'blue';
          } else if (isPublished) {
            action = 'Content published';
            icon = '✅';
            color = 'green';
          } else if (isUpdated) {
            action = 'Content updated';
            icon = '✏️';
            color = 'yellow';
          } else {
            action = 'Content modified';
            icon = '📄';
            color = 'gray';
          }
          
          return {
            id: item.id,
            action,
            title: item.title,
            status: item.status || 'DRAFT',
            timestamp: getTimeAgo(item.updatedAt),
            icon,
            color
          };
        });
      
      setStats({
        totalPosts,
        published,
        drafts,
        featured,
        contentTypeBreakdown,
        recentActivity
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
      console.error('Error fetching content:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper function to get time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PUBLISHED': return 'text-green-600';
      case 'DRAFT': return 'text-yellow-600';
      case 'ARCHIVED': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchContent();
    }
  }, [mounted, fetchContent]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Content</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchContent}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-lg text-gray-600 mt-2">Create, edit, and manage all your content</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/content-creation-guide"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Content Guide
            </Link>
            <Link
              href="/admin/test-phase3"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Features
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Content</h3>
                <p className="text-sm text-gray-600">Start writing new articles and posts</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Get Started
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Content Analytics</h3>
                <p className="text-sm text-gray-600">Track performance and engagement</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              View Analytics
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
                <p className="text-sm text-gray-600">Find specific content quickly</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Search Content
            </Link>
          </div>
        </div>

        {/* Content Types */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📄</span>
                <div>
                  <h4 className="font-medium text-gray-900">Blog Posts</h4>
                  <p className="text-sm text-gray-600">
                    {stats.contentTypeBreakdown.blog ? `${stats.contentTypeBreakdown.blog} posts` : 'No posts yet'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📚</span>
                <div>
                  <h4 className="font-medium text-gray-900">Documentation</h4>
                  <p className="text-sm text-gray-600">
                    {stats.contentTypeBreakdown.documentation ? `${stats.contentTypeBreakdown.documentation} guides` : 'No guides yet'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-medium text-gray-900">Landing Pages</h4>
                  <p className="text-sm text-gray-600">
                    {stats.contentTypeBreakdown.landing ? `${stats.contentTypeBreakdown.landing} pages` : 'No pages yet'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📰</span>
                <div>
                  <h4 className="font-medium text-gray-900">Newsletters</h4>
                  <p className="text-sm text-gray-600">
                    {stats.contentTypeBreakdown.newsletter ? `${stats.contentTypeBreakdown.newsletter} newsletters` : 'No newsletters yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center`}>
                    <span className={`text-${activity.color}-600`}>{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                         <p className="text-xs text-gray-600">&ldquo;{activity.title}&rdquo; - {activity.timestamp}</p>
                  </div>
                  <span className={`text-xs ${getStatusColor(activity.status)}`}>{activity.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📝</div>
              <p className="text-gray-500 text-lg">No recent activity to display yet</p>
              <p className="text-gray-400 text-sm">Start creating content to see activity here</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-600">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.totalPosts}
                </p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-600">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.published}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-yellow-600">✏️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.drafts}
                </p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-purple-600">⭐</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : stats.featured}
                </p>
                <p className="text-sm text-gray-600">Featured</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State Message */}
        {!isLoading && stats.totalPosts === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <div className="text-blue-600 text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">Welcome to Content Management!</h3>
                           <p className="text-blue-700 mb-4">
                 You haven&apos;t created any content yet. Start building your content library by creating your first post.
               </p>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
