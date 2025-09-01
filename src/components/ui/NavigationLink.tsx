'use client';

import Link from 'next/link';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function NavigationLink({ 
  href, 
  children, 
  className = '',
  onClick
}: NavigationLinkProps) {
  return (
    <Link 
      href={href} 
      className={`michroma text-white/90 hover:text-white font-medium text-base transition-all duration-300 hover:scale-105 ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
