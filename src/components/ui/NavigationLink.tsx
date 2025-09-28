'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`michroma font-medium text-base transition-all duration-300 hover:scale-105 ${
        isActive
          ? 'text-white underline decoration-2 underline-offset-4'
          : 'text-white/90 hover:text-white'
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
