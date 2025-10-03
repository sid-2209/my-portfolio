"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Section {
  id: string;
  label: string;
  elementId: string;
}

interface ScrollProgressIndicatorProps {
  sections: Section[];
}

export default function ScrollProgressIndicator({ sections }: ScrollProgressIndicatorProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Calculate scroll progress
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    setScrollProgress(progress);

    // Show indicator after scrolling past 30% of hero section
    setIsVisible(scrollTop > window.innerHeight * 0.3);
  }, []);

  useEffect(() => {
    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  // Set up Intersection Observer for dynamic sections
  useEffect(() => {
    // Clear existing observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current = [];

    if (!sections || sections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px', // Trigger when section is in middle 60% of viewport
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };

    sections.forEach((section, index) => {
      const element = document.getElementById(section.elementId);
      if (!element) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            setActiveSection(index);
          }
        });
      }, observerOptions);

      observer.observe(element);
      observersRef.current.push(observer);
    });

    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
    };
  }, [sections]);

  // Scroll to section when clicked with offset for header
  const handleSectionClick = (index: number) => {
    const section = sections[index];
    if (!section) return;

    const element = document.getElementById(section.elementId);
    if (element) {
      // Use smooth scrolling with offset
      const offsetTop = element.offsetTop - 80; // 80px offset for better positioning
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && activeSection < sections.length - 1) {
        e.preventDefault();
        handleSectionClick(activeSection + 1);
      } else if (e.key === 'ArrowUp' && activeSection > 0) {
        e.preventDefault();
        handleSectionClick(activeSection - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, sections.length]);

  // Don't render if no sections
  if (!sections || sections.length === 0) return null;

  const indicators = Array.from({ length: sections.length }, (_, i) => i);

  return (
    <div
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end space-y-4 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {indicators.map((index) => {
        const isActive = index === activeSection;
        const isPassed = index < activeSection;

        return (
          <button
            key={index}
            onClick={() => handleSectionClick(index)}
            className="group relative flex items-center gap-3 cursor-pointer"
            aria-label={sections[index]?.label || `Section ${index + 1}`}
          >
            {/* Tooltip */}
            <span className="absolute right-12 opacity-0 group-hover:opacity-100 transition-all duration-300 text-white/90 text-xs font-medium bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 whitespace-nowrap shadow-lg pointer-events-none">
              {sections[index]?.label || `Section ${index + 1}`}
            </span>

            {/* Progress Line with Animation */}
            <div className="relative">
              <div
                className={`h-0.5 rounded-full transition-all duration-500 ease-out ${
                  isActive
                    ? 'w-10 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                    : isPassed
                    ? 'w-8 bg-white/50 group-hover:bg-white/70'
                    : 'w-6 bg-white/25 group-hover:bg-white/40 group-hover:w-7'
                }`}
                style={{
                  transformOrigin: 'right'
                }}
              />
              {/* Active pulse effect */}
              {isActive && (
                <div className="absolute top-0 right-0 h-0.5 w-10 bg-white/40 rounded-full animate-pulse" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
