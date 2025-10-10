'use client';

import { ReactNode } from 'react';

interface BreakoutContainerProps {
  children: ReactNode;
  width?: number | 'text' | 'media' | 'full'; // number = percentage (15-100)
  className?: string;
}

/**
 * BreakoutContainer - Allows content to break out of the constrained text width
 * Used for media blocks (images, videos, charts) to take more visual space
 *
 * Width modes:
 * - number: Specific percentage width (15%, 20%, 25%, 30%, 35%, 40%, 45%, 50%, 60%, 70%, 100%)
 * - text: 45% viewport (backwards compatibility)
 * - media: 70% viewport (backwards compatibility)
 * - full: 100% viewport (backwards compatibility)
 *
 * Uses negative margin technique to break out of parent max-w-4xl constraint
 */
export default function BreakoutContainer({
  children,
  width = 70, // Default to 70% (matching old 'media' width)
  className = ''
}: BreakoutContainerProps) {
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

  const widthPercent = getWidthPercentage(width);

  // For small widths (≤45%), no breakout needed - stays within parent container
  if (widthPercent <= 45) {
    return (
      <div
        className={`mx-auto transition-all duration-300 ${className}`}
        style={{ maxWidth: `${widthPercent}%` }}
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
          // Use percentage-based max-width for precise control
          maxWidth: widthPercent === 100 ? 'none' : `${widthPercent}%`
        }}
      >
        {children}
      </div>
    </div>
  );
}
