'use client';

import { Content } from '../lib/db';
import Image from 'next/image';

interface ContentCardProps {
  content: Content;
  onClick?: () => void;
}

export default function ContentCard({ content, onClick }: ContentCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'PROJECT';
      case 'case_study':
        return 'CASE STUDY';
      case 'blog':
        return 'BLOG';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div className="backdrop-blur-[2px] bg-white/20 border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-start space-x-6">
          {/* Text Content - Left Side */}
          <div className="flex-1 min-w-0">
            {/* Category and Date */}
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {getContentTypeLabel(content.contentType)}
              </span>
              <div className="w-px h-3 bg-gray-300"></div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {formatDate(content.publishedDate)}
              </span>
            </div>
            
            {/* Headline */}
            <h2 className="text-xl font-bold text-gray-800 mb-3 leading-tight group-hover:underline transition-all duration-300">
              {content.title}
            </h2>
            
            {/* Summary/Description */}
            <p className="text-gray-600 mb-4 leading-relaxed text-sm">
              {content.description}
            </p>
            
            {/* Author */}
            <p className="text-xs text-gray-500">
              By <span className="font-medium">{content.author}</span>
            </p>
            
            {/* Tags */}
            {content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Image - Right Side */}
          <div className="flex-shrink-0">
            {content.posterImage ? (
              <Image
                src={content.posterImage}
                alt={content.title}
                width={128}
                height={128}
                className="rounded-xl shadow-lg"
                priority={false}
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {content.title.substring(0, 3).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
