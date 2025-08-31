'use client';

import { Content } from '../lib/db';
import HeroSection from './HeroSection';
import SecondaryPosts from './SecondaryPosts';
import TertiaryPosts from './TertiaryPosts';

interface HomePageLayoutProps {
  featuredContent: Content | null;
  secondaryPosts: Content[];
  tertiaryPosts: Content[];
}

export default function HomePageLayout({ 
  featuredContent, 
  secondaryPosts, 
  tertiaryPosts 
}: HomePageLayoutProps) {
  return (
    <div className="space-y-16">
      {/* Top Section: Featured Post + Secondary Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Post - Left Side (2/3 width) */}
        <div className="lg:col-span-2">
          {featuredContent && <HeroSection featuredContent={featuredContent} />}
        </div>
        
        {/* Secondary Posts - Right Side (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {secondaryPosts.slice(0, 3).map((post, index) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="flex space-x-4">
                  {/* Small Square Image */}
                  <div className="flex-shrink-0">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white text-lg font-bold shadow-md">
                        {post.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Written by: <span className="font-medium">{post.author}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.publishedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      }).toUpperCase()}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Section: Tertiary Posts - Full Width */}
      {tertiaryPosts.length > 0 && (
        <TertiaryPosts posts={tertiaryPosts} />
      )}
    </div>
  );
}
