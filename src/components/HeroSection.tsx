'use client';

import { Content } from '../lib/db';
import { formatDate } from '../lib/utils/dateFormatter';
import { getContentTypeLabel } from '../lib/utils/contentTypeLabels';
import Image from 'next/image';

interface HeroSectionProps {
  featuredContent: Content;
}

export default function HeroSection({ featuredContent }: HeroSectionProps) {
  return (
    <section className="mb-16">
      {/* Featured Post - Full Width Hero with Image Overlay */}
      <article className="group cursor-pointer relative">
        <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1]">
          {/* Hero Image - Fills entire container */}
          {featuredContent.imageUrl ? (
            <Image
              src={featuredContent.imageUrl}
              alt={featuredContent.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={true}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-6xl font-bold">
              {featuredContent.title.substring(0, 3).toUpperCase()}
            </div>
          )}
          
          {/* Dark Overlay for Better Text Readability */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-500"></div>
          
          {/* Glassmorphism Content Overlay - Proportional to Content Box */}
          <div className="absolute inset-0 flex items-end justify-start p-6 lg:p-8">
            {/* Scaled down box maintaining aspect ratio with proper overflow handling */}
            <div className="w-1/2 h-1/2 backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-4 lg:p-6 shadow-xl flex flex-col justify-end overflow-hidden">
              {/* Category and Date - Compact and contained */}
              <div className="flex items-center space-x-2 mb-3 min-h-0">
                <span className="text-xs font-medium text-white/90 uppercase tracking-wider px-2 py-1 bg-white/20 rounded-full border border-white/30 truncate flex-shrink-0">
                  {featuredContent.category || getContentTypeLabel(featuredContent.contentType)}
                </span>
                <div className="w-px h-2 bg-white/50 flex-shrink-0"></div>
                <span className="text-xs font-medium text-white/90 uppercase tracking-wider truncate">
                  {formatDate(featuredContent.publishedDate, 'short')}
                </span>
              </div>
              
              {/* Hero Title - Dynamic text sizing with overflow protection */}
              <div className="mb-4 min-h-0 flex-1 flex items-end">
                <h1 className="hero-title text-xs lg:text-sm xl:text-base font-bold text-white leading-tight drop-shadow-lg break-words line-clamp-2">
                  {featuredContent.title}
                </h1>
              </div>
              
              {/* Tags - Bottom row, fully contained */}
              <div className="flex items-center justify-between min-h-0 mt-auto pt-2">
                {featuredContent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {featuredContent.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/20 text-white text-xs font-medium rounded-full border border-white/30 backdrop-blur-sm truncate max-w-24"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
