'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollFadeContainerProps {
  children: ReactNode;
  fadeStart?: number; // Distance from top where fade starts (default: 120px)
  fadeDistance?: number; // Distance over which fade occurs (default: 200px for ultra-smooth fade)
}

export default function ScrollFadeContainer({
  children,
  fadeStart = 120,
  fadeDistance = 200
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

          // Create multi-stop gradient for smooth, natural ease-out curve
          // Simulates ease-out easing for more natural fade
          const preFade = Math.max(0, fadeDepth - 30); // Pre-fade buffer for softer start
          const stop1 = Math.max(0, fadeDepth); // Start of fade zone
          const stop2 = Math.max(0, fadeDepth + fadeDistance * 0.25); // 25% - slow start
          const stop3 = Math.max(0, fadeDepth + fadeDistance * 0.5); // 50% - accelerate
          const stop4 = Math.max(0, fadeDepth + fadeDistance * 0.75); // 75% - continue
          const stop5 = Math.max(0, fadeDepth + fadeDistance); // 100% - decelerate to full

          const maskGradient = `linear-gradient(to bottom,
            transparent 0px,
            rgba(0, 0, 0, 0.05) ${preFade}px,
            rgba(0, 0, 0, 0.15) ${stop1}px,
            rgba(0, 0, 0, 0.4) ${stop2}px,
            rgba(0, 0, 0, 0.7) ${stop3}px,
            rgba(0, 0, 0, 0.9) ${stop4}px,
            black ${stop5}px,
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
