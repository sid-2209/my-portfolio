"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface Section {
  id: string;
  label: string;
}

interface ScrollProgressIndicatorProps {
  sections?: Section[];
}

export default function ScrollProgressIndicator({ sections = [] }: ScrollProgressIndicatorProps) {
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

    // Show indicator after scrolling past hero (100vh)
    setIsVisible(scrollTop > window.innerHeight * 0.3);

    // Fallback: Calculate section based on scroll percentage if no observers
    if (!sections.length) {
      const totalSections = 5;
      const sectionHeight = 100 / totalSections;
      const currentSection = Math.floor(progress / sectionHeight);
      setActiveSection(Math.min(currentSection, totalSections - 1));
    }
  }, [sections.length]);

  useEffect(() => {
    handleScroll(); // Initial calculation
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  // Set up Intersection Observer for sections
  useEffect(() => {
    // Clear existing observers
    observersRef.current.forEach(observer => observer.disconnect());
    observersRef.current = [];

    if (!sections.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px', // Trigger when section is in middle 60% of viewport
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };

    sections.forEach((section, index) => {
      const element = document.getElementById(section.id);
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

  // Scroll to section when clicked
  const handleSectionClick = (index: number) => {
    if (sections[index]?.id) {
      // Scroll to specific section ID
      const element = document.getElementById(sections[index].id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    // Fallback to percentage-based scrolling
    const totalSections = sections.length || 5;
    const targetProgress = (index / totalSections) * 100;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (targetProgress / 100) * docHeight;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  const totalSections = sections.length || 5;
  const indicators = Array.from({ length: totalSections }, (_, i) => i);

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
            {sections[index]?.label && (
              <span className="absolute right-12 opacity-0 group-hover:opacity-100 transition-all duration-300 text-white/90 text-xs font-medium bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 whitespace-nowrap shadow-lg pointer-events-none">
                {sections[index].label}
              </span>
            )}

            {/* Progress Line */}
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
          </button>
        );
      })}
    </div>
  );
}
