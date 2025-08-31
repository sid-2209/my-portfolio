'use client';

import { useState, useEffect, useCallback } from 'react';
import { Content, ContentType } from '../lib/db';
import ContentCard from './ContentCard';
import LoadingSpinner from './ui/LoadingSpinner';
import ErrorState from './ui/ErrorState';
import EmptyState from './ui/EmptyState';

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
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState message={`Error: ${error}`} onRetry={fetchContent} />;
  }

  if (content.length === 0) {
    const message = searchQuery 
      ? `No content found for "${searchQuery}"`
      : contentType 
      ? `No ${contentType.replace('_', ' ')} content available yet`
      : 'No content available yet';
    
    return <EmptyState message={message} />;
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
