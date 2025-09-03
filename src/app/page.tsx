"use client";

import { useState, useEffect } from "react";
import GlassmorphismBox from "../components/ui/GlassmorphismBox";
import CircularRing from "../components/ui/CircularRing";
import GlassmorphismButton from "../components/ui/GlassmorphismButton";
import { ChevronRightIcon, ChevronLeftIcon } from "../components/ui/Icons";

interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  category?: string | null;
  featured?: boolean;
  posterImage?: string | null;
  imageUrl?: string | null;
  contentUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface FeaturedContentResponse {
  content: Content[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<Content[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeaturedContent = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/content/featured?page=${page}&limit=4`);
      if (!response.ok) {
        throw new Error('Failed to fetch featured content');
      }
      const data: FeaturedContentResponse = await response.json();
      setFeaturedContent(data.content);
      setCurrentPage(data.currentPage);
      setHasNext(data.hasNext);
      setHasPrevious(data.hasPrevious);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      fetchFeaturedContent(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      fetchFeaturedContent(currentPage - 1);
    }
  };

  const handlePostClick = (contentId: string) => {
    window.location.href = `/content/${contentId}`;
  };

  useEffect(() => {
    fetchFeaturedContent(1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-white/60">Loading featured posts...</div>
        </div>
      ) : featuredContent.length > 0 ? (
        <>
          {/* Dynamic Post Layout - Position 4 (Top Right) */}
          {featuredContent[3] && (
            <div className="flex justify-end items-end min-h-[60vh] pb-2 pr-20 relative">
              <div 
                className="cursor-pointer"
                onClick={() => handlePostClick(featuredContent[3].id)}
              >
                <GlassmorphismBox 
                  variant="post" 
                  className="p-4 w-96 h-64 overflow-hidden"
                >
                  {featuredContent[3].imageUrl ? (
                    <img 
                      src={featuredContent[3].imageUrl} 
                      alt={featuredContent[3].title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center rounded-lg">
                      <div className="text-white/40 text-sm">No Image</div>
                    </div>
                  )}
                </GlassmorphismBox>
              </div>
              <div className="absolute -bottom-2 left-200.5 z-10">
                <CircularRing size="sm" />
              </div>
            </div>
          )}

          {/* Dynamic Post Layout - Position 3 (Bottom Right) */}
          {featuredContent[2] && (
            <div className="flex justify-end items-start min-h-[60vh] -mt-106 pr-135">
              <div 
                className="cursor-pointer"
                onClick={() => handlePostClick(featuredContent[2].id)}
              >
                <GlassmorphismBox 
                  variant="post" 
                  className="p-4 w-96 h-64 overflow-hidden"
                >
                  {featuredContent[2].imageUrl ? (
                    <img 
                      src={featuredContent[2].imageUrl} 
                      alt={featuredContent[2].title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center rounded-lg">
                      <div className="text-white/40 text-sm">No Image</div>
                    </div>
                  )}
                </GlassmorphismBox>
              </div>
              <div className="absolute bottom-143 left-245 z-10">
                <CircularRing size="sm" />
              </div>
            </div>
          )}

          {/* Dynamic Post Layout - Position 2 (Bottom Left) */}
          {featuredContent[1] && (
            <div className="flex justify-start items-start min-h-[60vh] -mt-143 -ml-64">
              <div 
                className="cursor-pointer"
                onClick={() => handlePostClick(featuredContent[1].id)}
              >
                <GlassmorphismBox 
                  variant="post" 
                  className="p-4 w-96 h-64 overflow-hidden"
                >
                  {featuredContent[1].imageUrl ? (
                    <img 
                      src={featuredContent[1].imageUrl} 
                      alt={featuredContent[1].title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center rounded-lg">
                      <div className="text-white/40 text-sm">No Image</div>
                    </div>
                  )}
                </GlassmorphismBox>
              </div>
              <div className="absolute bottom-145 left-187 z-10">
                <CircularRing size="sm" />
              </div>            
            </div>
          )}

          {/* Dynamic Post Layout - Position 1 (Top Left) */}
          {featuredContent[0] && (
            <div className="flex justify-center items-start min-h-[60vh] -mt-345 -ml-219">
              <div 
                className="cursor-pointer"
                onClick={() => handlePostClick(featuredContent[0].id)}
              >
                <GlassmorphismBox 
                  variant="post" 
                  className="p-4 w-96 h-64 overflow-hidden"
                >
                  {featuredContent[0].imageUrl ? (
                    <img 
                      src={featuredContent[0].imageUrl} 
                      alt={featuredContent[0].title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-white/40 text-sm">No Image</div>
                  )}
                </GlassmorphismBox>
              </div>
              <div className="absolute bottom-257 left-159 z-10">
                <CircularRing size="sm" />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-center items-center absolute bottom-18 right-35 z-20 space-x-4">
            {hasPrevious && (
              <GlassmorphismButton
                onClick={handlePreviousPage}
                size="xl"
                className="text-white/90 hover:text-white transition-all duration-300"
              >
                <ChevronLeftIcon size={24} />
              </GlassmorphismButton>
            )}
            {hasNext && (
              <GlassmorphismButton
                onClick={handleNextPage}
                size="xl"
                className="text-white/90 hover:text-white transition-all duration-300"
              >
                <ChevronRightIcon size={24} />
              </GlassmorphismButton>
            )}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-white/60">No featured posts available</div>
        </div>
      )}
    </div>
  );
}
