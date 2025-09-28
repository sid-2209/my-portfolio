'use client';

import { ReactNode } from 'react';

interface GlassmorphismContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'navbar' | 'sidebar' | 'search' | 'content';
}

export default function GlassmorphismContainer({ 
  children, 
  className = '',
  variant = 'navbar'
}: GlassmorphismContainerProps) {
  const variantClasses = {
    navbar: 'backdrop-blur-[12px] bg-gradient-to-r from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)]',
    sidebar: 'backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)]',
    search: 'backdrop-blur-[12px] bg-gradient-to-r from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.18] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)]',
    content: 'backdrop-blur-[12px] bg-gradient-to-b from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_25px_rgba(255,255,255,0.02),0_0_50px_rgba(255,255,255,0.01)]'
  };

  return (
    <div className={`${variantClasses[variant]} transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
}
