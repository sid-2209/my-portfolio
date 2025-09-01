'use client';

import { ReactNode } from 'react';

interface GlassmorphismBoxProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'post' | 'featured';
}

export default function GlassmorphismBox({ 
  children, 
  className = '',
  variant = 'default'
}: GlassmorphismBoxProps) {
  const variantClasses = {
    default: 'backdrop-blur-[20px] bg-gradient-to-br from-white/[0.15] via-white/[0.08] via-white/[0.04] via-white/[0.08] to-white/[0.15] border border-white/[0.2] rounded-2xl',
    post: 'backdrop-blur-[20px] bg-gradient-to-br from-white/[0.12] via-white/[0.06] via-white/[0.03] via-white/[0.06] to-white/[0.12] border border-white/[0.25] rounded-xl',
    featured: 'backdrop-blur-[20px] bg-gradient-to-br from-white/[0.18] via-white/[0.10] via-white/[0.05] via-white/[0.10] to-white/[0.18] border border-white/[0.3] rounded-3xl'
  };

  return (
    <div className={`${variantClasses[variant]} shadow-[0_8px_32px_rgba(0,0,0,0.8),0_2px_8px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_25px_rgba(255,255,255,0.03),0_0_50px_rgba(255,255,255,0.01)] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.9),0_4px_12px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.6),0_0_30px_rgba(255,255,255,0.05)] ${className}`}>
      {children}
    </div>
  );
}
