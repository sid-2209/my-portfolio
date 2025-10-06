'use client';

import { ReactNode } from 'react';

interface BreakoutContainerProps {
  children: ReactNode;
  width?: 'text' | 'media' | 'full';
  className?: string;
}

/**
 * BreakoutContainer - Allows content to break out of the constrained text width
 * Used for media blocks (images, videos, charts) to take more visual space
 *
 * Width modes:
 * - text: 45% viewport (max-w-4xl) - matches text content, no breakout
 * - media: 70% viewport (max-w-6xl) - wider for media, breaks out of parent
 * - full: 100% viewport - full width, breaks out of parent
 *
 * Uses negative margin technique to break out of parent max-w-4xl constraint
 */
export default function BreakoutContainer({
  children,
  width = 'media',
  className = ''
}: BreakoutContainerProps) {
  // Width class mapping for inner content
  const widthClasses = {
    text: 'max-w-4xl',       // ~45% viewport - matches text content
    media: 'max-w-6xl',      // ~70% viewport - wider for media
    full: 'max-w-none'       // 100% viewport - full width
  };

  // For 'text' width, no breakout needed - stays within parent container
  if (width === 'text') {
    return (
      <div className={`${widthClasses[width]} mx-auto transition-all duration-300 ${className}`}>
        {children}
      </div>
    );
  }

  // For 'media' and 'full' widths, use full-width breakout with negative margins
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
          ${widthClasses[width]}
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          transition-all
          duration-300
        `}
      >
        {children}
      </div>
    </div>
  );
}
