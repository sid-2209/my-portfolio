'use client';

interface CircularRingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export default function CircularRing({ 
  size = 'sm', 
  className = '',
  children
}: CircularRingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const ringClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} backdrop-blur-[20px] bg-gradient-to-br from-white/[0.35] via-white/[0.25] via-white/[0.15] to-white/[0.05] border border-white/[0.3] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),0_0_15px_rgba(255,255,255,0.03),0_0_30px_rgba(255,255,255,0.01)] ${className}`}>
      <div className={`${ringClasses[size]} bg-transparent border border-white/[0.2] rounded-full flex items-center justify-center`}>
        {children}
      </div>
    </div>
  );
}
