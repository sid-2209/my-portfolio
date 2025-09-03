'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'centered';
}

export default function EmptyState({ 
  title, 
  description, 
  icon, 
  actionText, 
  onAction, 
  className = '',
  variant = 'default'
}: EmptyStateProps) {
  const variantClasses = {
    default: "text-center py-12",
    minimal: "text-center py-8", 
    centered: "text-center py-16"
  };

  const iconContainerSizes = {
    default: "w-16 h-16 bg-gray-100 rounded-full",
    minimal: "w-12 h-12 bg-gray-50 rounded-lg",
    centered: "w-20 h-20 bg-gray-100 rounded-full"
  };

  const iconSvgSizes = {
    default: "w-8 h-8",
    minimal: "w-6 h-6", 
    centered: "w-10 h-10"
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      <div className={`${iconContainerSizes[variant]} flex items-center justify-center mx-auto mb-4`}>
        <div className={`${iconSvgSizes[variant]} text-gray-400`}>
          {icon}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold transition-colors duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
