'use client';

import { Content } from '../lib/db';
import { formatDate } from '../lib/utils/dateFormatter';
import { getContentTypeLabel } from '../lib/utils/contentTypeLabels';
import Image from 'next/image';

interface TertiaryPostsProps {
  posts: Content[];
}

export default function TertiaryPosts({ posts }: TertiaryPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="section-title text-3xl font-bold text-gray-800 mb-8 text-center">
        More Content
      </h2>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="group cursor-pointer">
            <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <div className="flex space-x-6">
                {/* Square Image - Left Side */}
                <div className="flex-shrink-0">
                  {post.imageUrl ? (
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={120}
                      height={120}
                      className="w-30 h-30 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-30 h-30 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-md">
                      {post.title.substring(0, 3).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Content - Right Side */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Written by: <span className="font-medium">{post.author}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(post.publishedDate, 'short')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
