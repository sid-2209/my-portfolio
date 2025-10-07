'use client';

interface AudioPodcastIndicatorProps {
  className?: string;
}

export default function AudioPodcastIndicator({ className = '' }: AudioPodcastIndicatorProps) {
  return (
    <span
      className={`italic text-xs text-white/70 animate-blink ${className}`}
      aria-label="This post contains an audio podcast"
    >
      Contains audio podcast
    </span>
  );
}
