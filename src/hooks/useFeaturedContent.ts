'use client';

import { useState, useEffect } from 'react';
import { Content } from '../lib/db';

export function useFeaturedContent() {
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get featured content
        let response = await fetch('/api/content/featured');
        
        if (!response.ok) {
          // If no featured content API, fall back to getting the first content item
          response = await fetch('/api/content');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }

        const data = await response.json();
        
        if (data.length > 0) {
          // If it's an array, take the first item
          const content = Array.isArray(data) ? data[0] : data;
          setFeaturedContent(content);
        } else {
          setFeaturedContent(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, []);

  return { featuredContent, loading, error };
}
