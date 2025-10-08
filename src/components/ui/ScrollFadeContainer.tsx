'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollFadeContainerProps {
  children: ReactNode;
  fadeStart?: number; // Distance from top where fade starts (default: 120px)
  fadeDistance?: number; // Distance over which fade occurs (default: 80px)
}

export default function ScrollFadeContainer({
  children,
  fadeStart = 120,
  fadeDistance = 80
}: ScrollFadeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;

      // BlockRenderer returns <div className="space-y-6"> as first child
      // Get the actual content blocks (direct children of that div)
      const blocksWrapper = container.firstElementChild;
      if (!blocksWrapper) return;

      const contentBlocks = Array.from(blocksWrapper.children) as HTMLElement[];

      // For each content block, apply gradient mask based on position
      contentBlocks.forEach((block) => {
        const rect = block.getBoundingClientRect();
        const blockTop = rect.top;

        if (blockTop < fadeStart) {
          // Element is in or entering fade zone
          // Calculate how deep into fade zone (how much has crossed threshold)
          const fadeDepth = fadeStart - blockTop;

          // Apply gradient mask that reveals content progressively
          // Content from 0 to fadeDepth is transparent (faded out)
          // Content from fadeDepth to fadeDepth+fadeDistance gradually appears
          // Content beyond fadeDepth+fadeDistance is fully visible
          const maskGradient = `linear-gradient(to bottom,
            transparent 0px,
            transparent ${Math.max(0, fadeDepth)}px,
            black ${Math.max(0, fadeDepth + fadeDistance)}px,
            black 100%
          )`;

          block.style.webkitMaskImage = maskGradient;
          block.style.maskImage = maskGradient;
        } else {
          // Element is below threshold - fully visible (no mask)
          block.style.webkitMaskImage = 'none';
          block.style.maskImage = 'none';
        }
      });
    };

    // Initial check
    handleScroll();

    // Add scroll listener with requestAnimationFrame for smooth performance
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [fadeStart, fadeDistance]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
