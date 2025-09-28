'use client';

import Image from 'next/image';

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

interface FeaturedSectionProps {
  content: FeaturedContent;
  onContentClick: (id: string) => void;
}

export default function FeaturedSection({ content, onContentClick }: FeaturedSectionProps) {
  const truncateDescription = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  };

  const calculateReadingTime = (description: string): string => {
    const wordsPerMinute = 200;
    const words = description.split(' ').length;
    const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContentTypeLabel = (type: string): string => {
    const typeMap = {
      'project': 'Project',
      'case_study': 'Case Study',
      'blog': 'Note'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const handleClick = () => {
    onContentClick(content.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onContentClick(content.id);
    }
  };

  const truncatedDescription = truncateDescription(content.description);
  const contentTypeLabel = getContentTypeLabel(content.contentType);
  const formattedDate = formatDate(content.publishedDate);
  const readingTime = calculateReadingTime(content.description);

  return (
    <article
      className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 group"
      role="main"
      aria-label="Featured content"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-[16/9] mb-6">
        {/* Gradient Border Container */}
        <div
          className="w-full h-full rounded-2xl p-2"
          style={{
            background: 'linear-gradient(135deg, #333538 0%, #555863 100%)'
          }}
        >
          <div className="relative w-full h-full rounded-xl overflow-hidden">
            {content.imageUrl ? (
              <Image
                src={content.imageUrl}
                alt={content.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 45vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                <div className="text-white/40 text-lg font-medium">
                  {contentTypeLabel}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section - Below Image */}
      <header className="text-center">
        <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 transition-all duration-300 ease-out group-hover:underline decoration-2 underline-offset-4">
          {content.title}
        </h1>

        <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed mb-6 max-w-2xl mx-auto">
          {truncatedDescription}
        </p>

        <div className="text-sm md:text-base text-white/70 flex flex-wrap items-center justify-center gap-2">
          <span className="font-medium">{contentTypeLabel}</span>
          <span aria-hidden="true" className="text-white/50">•</span>
          <time
            dateTime={content.publishedDate}
            className="font-medium"
          >
            {formattedDate}
          </time>
          <span aria-hidden="true" className="text-white/50">•</span>
          <span className="font-medium">{readingTime}</span>
        </div>
      </header>
    </article>
  );
}