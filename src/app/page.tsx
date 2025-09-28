"use client";

import { useState, useEffect } from "react";
import FeaturedSection from "../components/ui/FeaturedSection";
import MinimalistDivider from "../components/ui/MinimalistDivider";

interface FeaturedContent {
  id: string;
  title: string;
  description: string;
  contentType: 'project' | 'case_study' | 'blog';
  category?: string | null;
  imageUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
}

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeaturedContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content/featured?page=1&limit=1');
      if (!response.ok) {
        throw new Error('Failed to fetch featured content');
      }
      const data = await response.json();
      setFeaturedContent(data.content[0] || null);
    } catch (error) {
      console.error('Error fetching featured content:', error);
      setFeaturedContent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentClick = (contentId: string) => {
    window.location.href = `/content/${contentId}`;
  };

  useEffect(() => {
    fetchFeaturedContent();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[60vh]">
        <div className="text-white/60 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {featuredContent ? (
        <>
          <FeaturedSection
            content={featuredContent}
            onContentClick={handleContentClick}
          />
          <MinimalistDivider />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white/60 text-lg text-center">
            No featured content available
          </div>
        </div>
      )}
    </div>
  );
}
