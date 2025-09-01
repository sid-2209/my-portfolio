'use client';

import { ReactNode } from 'react';

interface GlassmorphismButtonProps {
  children: ReactNode;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
}

export default function GlassmorphismButton({ 
  children, 
  onClick, 
  size = 'md', 
  className = '',
  type = 'button'
}: GlassmorphismButtonProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      className={`${sizeClasses[size]} backdrop-blur-[20px] bg-gradient-to-br from-white/[0.35] via-white/[0.25] via-white/[0.15] to-white/[0.05] border border-white/[0.3] rounded-full flex items-center justify-center text-white/90 hover:text-white transition-all duration-300 hover:scale-110 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),0_0_15px_rgba(255,255,255,0.03),0_0_30px_rgba(255,255,255,0.01)] ${className}`}
    >
      {children}
    </button>
  );
}
