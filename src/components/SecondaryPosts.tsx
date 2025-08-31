'use client';

import { Content } from '../lib/db';
import { formatDate } from '../lib/utils/dateFormatter';
import { getContentTypeLabel } from '../lib/utils/contentTypeLabels';
import Image from 'next/image';

interface SecondaryPostsProps {
  posts: Content[];
}

export default function SecondaryPosts({ posts }: SecondaryPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Post - Left Side (2/3 width) */}
        <div className="lg:col-span-2">
          {/* This will be filled by HeroSection */}
        </div>
        
        {/* Secondary Posts - Right Side (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {posts.slice(0, 3).map((post, index) => (
              <article key={post.id} className="group cursor-pointer">
                <div className="flex space-x-4">
                  {/* Small Square Image */}
                  <div className="flex-shrink-0">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={80}
                        height={80}
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-1">
                      Written by: <span className="font-medium">{post.author}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.publishedDate, 'short')}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
