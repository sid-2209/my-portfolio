'use client';

import { useState, useEffect, useCallback } from 'react';
import { Content, ContentType } from '../lib/db';
import ContentCard from './ContentCard';

interface ContentGridProps {
  contentType?: ContentType | null;
  searchQuery?: string;
}

export default function ContentGrid({ contentType, searchQuery }: ContentGridProps) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/content';
      if (contentType) {
        url = `/api/content/${contentType}`;
      } else if (searchQuery) {
        url = `/api/content/search?q=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [contentType, searchQuery]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleContentClick = (content: Content) => {
    if (content.contentUrl) {
      window.open(content.contentUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={fetchContent}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {searchQuery 
            ? `No content found for "${searchQuery}"`
            : contentType 
            ? `No ${contentType.replace('_', ' ')} content available yet`
            : 'No content available yet'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {content.map((item) => (
        <ContentCard
          key={item.id}
          content={item}
          onClick={() => handleContentClick(item)}
        />
      ))}
    </div>
  );
}
