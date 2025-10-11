'use client';

import { ReactNode } from 'react';

interface BreakoutContainerProps {
  children: ReactNode;
  width?: number | 'text' | 'media' | 'full'; // number = percentage (15-200)
  className?: string;
}

/**
 * BreakoutContainer - Allows content to break out of the constrained text width
 * Used for media blocks (images, videos, charts) to take more visual space
 *
 * Width modes:
 * - number: Percentage of content container width (15% to 200%)
 * - text: 45% of content width (backwards compatibility)
 * - media: 70% of content width (backwards compatibility)
 * - full: 100% of content width (backwards compatibility)
 *
 * All percentages are relative to the content container (max-w-4xl = 56rem), NOT viewport
 * Widths >100% only apply on desktop (lg breakpoint), capped at 100% on tablet/mobile
 * Uses negative margin technique to break out of parent max-w-4xl constraint
 */
export default function BreakoutContainer({
  children,
  width = 70, // Default to 70% (matching old 'media' width)
  className = ''
}: BreakoutContainerProps) {
  // Content container max-width (matching max-w-4xl in page layouts)
  const CONTENT_MAX_WIDTH_REM = 56; // Tailwind's max-w-4xl = 56rem

  // Convert legacy string widths to percentages for backwards compatibility
  const getWidthPercentage = (w: number | 'text' | 'media' | 'full'): number => {
    if (typeof w === 'number') return w;
    switch (w) {
      case 'text': return 45;
      case 'media': return 70;
      case 'full': return 100;
      default: return 70;
    }
  };

  // Convert percentage to content-relative width in rem
  const getContentRelativeWidth = (percent: number): string => {
    const widthRem = (percent / 100) * CONTENT_MAX_WIDTH_REM;
    return `${widthRem}rem`;
  };

  const widthPercent = getWidthPercentage(width);

  // For small widths (≤45%), no breakout needed - stays within parent container
  if (widthPercent <= 45) {
    return (
      <div
        className={`mx-auto transition-all duration-300 ${className}`}
        style={{ maxWidth: getContentRelativeWidth(widthPercent) }}
      >
        {children}
      </div>
    );
  }

  // For larger widths (>45%), use full-width breakout with negative margins
  // This allows the content to break out of the parent max-w-4xl container
  return (
    <div
      className={`
        w-screen
        relative
        left-1/2
        right-1/2
        -ml-[50vw]
        -mr-[50vw]
        ${className}
      `}
      style={{
        // Additional inline styles for precise control
        maxWidth: '100vw',
      }}
    >
      <div
        className={`
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          transition-all
          duration-300
        `}
        style={{
          // Use content-relative width in rem (relative to max-w-4xl = 56rem)
          // For widths >100%, cap at 56rem on mobile/tablet, full width on desktop
          maxWidth: widthPercent > 100
            ? `min(${CONTENT_MAX_WIDTH_REM}rem, ${getContentRelativeWidth(widthPercent)})`
            : getContentRelativeWidth(widthPercent)
        }}
      >
        {children}
      </div>
    </div>
  );
}
