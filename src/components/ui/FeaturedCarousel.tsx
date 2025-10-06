'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FeaturedContent {
  id: string;
  title: string;
  description?: string | null;
  contentType: 'project' | 'case_study' | 'blog';
  category?: string | null;
  imageUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
}

interface FeaturedCarouselProps {
  content: FeaturedContent[];
  onContentClick: (id: string) => void;
}

export default function FeaturedCarousel({ content, onContentClick }: FeaturedCarouselProps) {
  const [contentOrder, setContentOrder] = useState<FeaturedContent[]>(content);
  const [activeIndex, setActiveIndex] = useState(0);

  // Update contentOrder when content prop changes
  useEffect(() => {
    setContentOrder(content);
    setActiveIndex(0); // Reset to first item when content changes
  }, [content]);

  // Handle case when there's no content
  if (!contentOrder || contentOrder.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="michroma text-white/60 text-lg text-center">
          No featured content available
        </div>
      </div>
    );
  }

  // Handle single post - use simple layout
  if (contentOrder.length === 1) {
    const post = contentOrder[0];
    return (
      <article
        className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 group"
        role="main"
        aria-label="Featured content"
        tabIndex={0}
        onClick={() => onContentClick(post.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onContentClick(post.id);
          }
        }}
      >
        <div className="relative w-full aspect-[16/9] mb-6">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
              padding: '2px'
            }}
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 45vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                  <div className="text-white/40 text-lg font-medium">
                    {getContentTypeLabel(post.contentType)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <header className="text-center">
          <h1 className="michroma text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 transition-all duration-300 ease-out group-hover:underline decoration-2 underline-offset-4">
            {post.title}
          </h1>
          {post.description && (
            <p className="michroma text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 max-w-2xl mx-auto">
              {truncateDescription(post.description)}
            </p>
          )}
          <div className="michroma text-sm md:text-base text-white/70 flex flex-wrap items-center justify-center gap-2">
            <span className="font-medium">{getContentTypeLabel(post.contentType)}</span>
            <span aria-hidden="true" className="text-white/50">•</span>
            <time dateTime={post.publishedDate} className="font-medium">
              {formatDate(post.publishedDate)}
            </time>
            <span aria-hidden="true" className="text-white/50">•</span>
            <span className="font-medium">{calculateReadingTime(post.description)}</span>
          </div>
        </header>
      </article>
    );
  }

  // Multi-post carousel layout
  const activePost = contentOrder[activeIndex];
  // Show all posts except the active one
  const thumbnails = contentOrder.filter((_, idx) => idx !== activeIndex);

  const handleThumbnailClick = (clickedPost: FeaturedContent) => {
    // Find the index of the clicked post in the current order
    const clickedIndex = contentOrder.findIndex(p => p.id === clickedPost.id);

    if (clickedIndex === -1) return;

    // Create new array with swapped positions
    const newOrder = [...contentOrder];
    // Swap: put clicked post at activeIndex position, put current active post at clicked position
    [newOrder[activeIndex], newOrder[clickedIndex]] = [newOrder[clickedIndex], newOrder[activeIndex]];

    setContentOrder(newOrder);
    // Active index stays the same (the new post is now at this position)
  };

  const handleMainClick = () => {
    onContentClick(activePost.id);
  };

  return (
    <div className="w-full py-8">
      {/* Centered wrapper - matches divider centering exactly */}
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* Box 1: Main Display (45vw on desktop) */}
          <div className="w-full">
            <article
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 group"
              tabIndex={0}
              onClick={handleMainClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMainClick();
                }
              }}
            >
              {/* Main Image */}
              <div className="relative w-full aspect-[16/9] mb-6">
                <div
                  className="w-full h-full rounded-2xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
                    padding: '2px'
                  }}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
                    {activePost.imageUrl ? (
                      <Image
                        key={activePost.id}
                        src={activePost.imageUrl}
                        alt={activePost.title}
                        fill
                        className="object-cover transition-all duration-300 grayscale group-hover:grayscale-0"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 45vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                        <div className="text-white/40 text-lg font-medium">
                          {getContentTypeLabel(activePost.contentType)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Info */}
              <div className="text-left">
                <h1 className="michroma text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 transition-all duration-300 ease-out group-hover:underline decoration-2 underline-offset-4">
                  {activePost.title}
                </h1>
                {activePost.description && (
                  <p className="michroma text-sm md:text-base lg:text-lg text-white/90 leading-relaxed mb-6">
                    {truncateDescription(activePost.description)}
                  </p>
                )}
                <div className="michroma text-xs md:text-sm text-white/70 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{getContentTypeLabel(activePost.contentType)}</span>
                  <span aria-hidden="true" className="text-white/50">•</span>
                  <time dateTime={activePost.publishedDate} className="font-medium">
                    {formatDate(activePost.publishedDate)}
                  </time>
                  <span aria-hidden="true" className="text-white/50">•</span>
                  <span className="font-medium">{calculateReadingTime(activePost.description)}</span>
                </div>
              </div>
            </article>
          </div>

          {/* Box 2: Thumbnail Sidebar - Right */}
          {thumbnails.length > 0 && (
            <div className="w-full lg:w-auto">
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
                {thumbnails.map((post) => {
                  return (
                    <button
                      key={post.id}
                      onClick={() => handleThumbnailClick(post)}
                      className="flex-shrink-0 w-60 lg:w-64 cursor-pointer transition-all duration-300 ease-out"
                      aria-label={`View ${post.title}`}
                    >
                      {/* Gradient border container */}
                      <div
                        className="w-full rounded-xl transition-all duration-300"
                        style={{
                          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
                          padding: '2px'
                        }}
                      >
                        <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden" style={{ backgroundColor: '#0d0d0d' }}>
                          {post.imageUrl ? (
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              fill
                              className="object-cover transition-all duration-300 grayscale hover:grayscale-0"
                              sizes="(max-width: 1024px) 240px, 256px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                              <div className="text-white/40 text-xs font-medium">
                                {getContentTypeLabel(post.contentType)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function truncateDescription(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

function calculateReadingTime(description?: string | null): string {
  if (!description) return '1 min read';
  const wordsPerMinute = 200;
  const words = description.split(' ').length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getContentTypeLabel(type: string): string {
  const typeMap = {
    'project': 'Project',
    'case_study': 'Case Study',
    'blog': 'Note'
  };
  return typeMap[type as keyof typeof typeMap] || type;
}
