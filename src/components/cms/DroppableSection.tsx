"use client";

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface DroppableSectionProps {
  id: 'featured' | 'all';
  title: string;
  count: string;
  maxCount?: number;
  currentCount: number;
  children: ReactNode;
  className?: string;
}

export default function DroppableSection({
  id,
  title,
  count,
  maxCount,
  currentCount,
  children,
  className = ''
}: DroppableSectionProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: 'section',
      sectionId: id
    }
  });

  // Determine if we can accept drops
  const isAtLimit = maxCount !== undefined && currentCount >= maxCount;
  const canAcceptDrop = id === 'featured' ? !isAtLimit : true;

  // Visual feedback based on drop state
  const getBorderClass = () => {
    if (!isOver) return 'border-white/10';
    if (id === 'featured' && isAtLimit) return 'border-red-500 border-2';
    return 'border-green-500 border-2';
  };

  const getBackgroundClass = () => {
    if (!isOver) return '';
    if (id === 'featured' && isAtLimit) return 'bg-red-500/5';
    return 'bg-green-500/5';
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-xl border ${getBorderClass()} ${getBackgroundClass()} transition-all duration-200 ${className}`}
    >
      {/* Drop zone indicator */}
      {isOver && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className={`px-6 py-3 rounded-lg ${isAtLimit ? 'bg-red-500/90' : 'bg-green-500/90'} text-white font-medium shadow-lg`}>
            {id === 'featured' && isAtLimit ? (
              <span>Cannot add - Maximum 5 posts reached</span>
            ) : id === 'featured' ? (
              <span>Drop here to feature ({currentCount + 1}/5)</span>
            ) : (
              <span>Drop here to unfeature</span>
            )}
          </div>
        </div>
      )}

      {/* Section header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="michroma text-xl text-white">{title}</h2>
            {maxCount && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                Carousel (Max {maxCount})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${currentCount >= (maxCount || Infinity) ? 'text-red-600' : 'text-gray-500'}`}>
              {count}
            </span>
            {id === 'featured' && currentCount > 0 && (
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <span>⚡</span>
                <span>First = Main Display</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
