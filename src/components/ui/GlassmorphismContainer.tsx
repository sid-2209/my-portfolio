'use client';

import { ReactNode } from 'react';

interface GlassmorphismContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'search';
}

export default function GlassmorphismContainer({ 
  children, 
  className = '',
  variant = 'navbar'
}: GlassmorphismContainerProps) {
  const variantClasses = {
    navbar: 'backdrop-blur-[20px] bg-gradient-to-r from-white/[0.15] via-white/[0.08] via-white/[0.04] via-white/[0.08] to-white/[0.15] border border-white/[0.2] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8),0_2px_8px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_25px_rgba(255,255,255,0.03),0_0_50px_rgba(255,255,255,0.01)]',
    sidebar: 'backdrop-blur-[20px] bg-gradient-to-b from-white/[0.15] via-white/[0.08] via-white/[0.04] via-white/[0.08] to-white/[0.15] border border-white/[0.2] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8),0_2px_8px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_25px_rgba(255,255,255,0.03),0_0_50px_rgba(255,255,255,0.01)]',
    search: 'backdrop-blur-[20px] bg-gradient-to-r from-white/[0.15] via-white/[0.08] via-white/[0.04] via-white/[0.08] to-white/[0.15] border border-white/[0.25] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.8),0_2px_8px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_25px_rgba(255,255,255,0.03),0_0_50px_rgba(255,255,255,0.01)]'
  };

  return (
    <div className={`${variantClasses[variant]} transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
}
