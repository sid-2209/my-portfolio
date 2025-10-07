'use client';

import Image from 'next/image';
import AudioPodcastIndicator from './AudioPodcastIndicator';

interface ContentItemProps {
  id: string;
  title: string;
  description?: string | null;
  contentType: 'project' | 'case_study' | 'blog';
  category?: string | null;
  imageUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
  contentBlocks?: { blockType: string }[];
  onContentClick: (id: string) => void;
}

export default function ContentItem({
  id,
  title,
  description,
  contentType,
  category,
  imageUrl,
  publishedDate,
  contentBlocks,
  onContentClick
}: ContentItemProps) {
  const isVideoUrl = (url: string): boolean => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) ||
           url.includes('video/');
  };

  const truncateDescription = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.substring(0, lastSpace) + '...';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const hasAudioPodcast = (blocks?: { blockType: string }[]): boolean => {
    return blocks?.some(block => block.blockType === 'AUDIO_EMBED') || false;
  };

  const handleClick = () => {
    onContentClick(id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onContentClick(id);
    }
  };

  const truncatedDescription = description ? truncateDescription(description) : null;
  const contentTypeLabel = getContentTypeLabel(contentType);
  const formattedDate = formatDate(publishedDate);

  return (
    <article
      className="flex gap-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 group"
      role="article"
      aria-label={`${contentTypeLabel}: ${title}`}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Image Section */}
      <div className="flex-shrink-0 w-48 h-36 sm:w-56 sm:h-40 md:w-64 md:h-48 lg:w-72 lg:h-52">
        {/* Transparent Fade Border Container */}
        <div
          className="w-full h-full rounded-2xl"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent)',
            padding: '2px'
          }}
        >
          <div
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{ backgroundColor: '#0d0d0d' }}
          >
            {imageUrl ? (
              isVideoUrl(imageUrl) ? (
                <video
                  src={imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 288px"
                />
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                <div className="michroma text-white/40 text-sm font-medium text-center">
                  {contentTypeLabel}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <h3 className="michroma text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-4 transition-all duration-300 ease-out group-hover:underline decoration-2 underline-offset-4 line-clamp-2">
          {title}
        </h3>

        {truncatedDescription && (
          <p className="michroma text-sm md:text-base lg:text-lg text-white/80 leading-relaxed mb-4 line-clamp-3">
            {truncatedDescription}
          </p>
        )}

        <div className="michroma text-xs md:text-sm text-white/60 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{contentTypeLabel}</span>
            <span aria-hidden="true" className="text-white/40">•</span>
            <time
              dateTime={publishedDate}
              className="font-medium"
            >
              {formattedDate}
            </time>
            {category && (
              <>
                <span aria-hidden="true" className="text-white/40">•</span>
                <span className="font-medium">{category}</span>
              </>
            )}
          </div>
          {hasAudioPodcast(contentBlocks) && <AudioPodcastIndicator />}
        </div>
      </div>
    </article>
  );
}