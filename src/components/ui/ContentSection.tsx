'use client';

import Link from 'next/link';
import ContentItem from './ContentItem';

interface ContentItemData {
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

interface ContentSectionProps {
  title: string;
  linkHref: string;
  linkText: string;
  contentItems: ContentItemData[];
  onContentClick: (id: string) => void;
  isLoading?: boolean;
}

export default function ContentSection({
  title,
  linkHref,
  linkText,
  contentItems,
  onContentClick,
  isLoading = false
}: ContentSectionProps) {
  if (isLoading) {
    return (
      <section className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 mb-16">
        <div className="mb-8">
          <div className="h-8 bg-white/10 rounded animate-pulse w-48"></div>
        </div>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-8 p-6">
              <div className="flex-shrink-0 w-48 h-36 sm:w-56 sm:h-40 md:w-64 md:h-48 lg:w-72 lg:h-52 bg-white/10 rounded-2xl animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-white/10 rounded animate-pulse mb-4 w-3/4"></div>
                <div className="h-6 bg-white/10 rounded animate-pulse mb-2 w-full"></div>
                <div className="h-6 bg-white/10 rounded animate-pulse mb-4 w-5/6"></div>
                <div className="h-5 bg-white/10 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (contentItems.length === 0) {
    return (
      <section className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 mb-16">
        <header className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          <Link
            href={linkHref}
            className="text-white/70 hover:text-white transition-colors duration-300 underline decoration-2 underline-offset-4"
          >
            {linkText}
          </Link>
        </header>
        <div className="text-white/60 text-center py-8">
          No {title.toLowerCase()} available
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 mb-16">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {title}
        </h2>
        <Link
          href={linkHref}
          className="text-white/70 hover:text-white transition-colors duration-300 underline decoration-2 underline-offset-4"
        >
          {linkText}
        </Link>
      </header>

      <div className="space-y-8">
        {contentItems.map((item) => (
          <ContentItem
            key={item.id}
            {...item}
            onContentClick={onContentClick}
          />
        ))}
      </div>
    </section>
  );
}