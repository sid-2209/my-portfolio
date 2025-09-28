"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Check if we're on admin pages or content pages
  const isAdminPage = pathname?.startsWith('/admin');
  const isContentPage = pathname?.startsWith('/content/');
  const isHomePage = pathname === '/';

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply homepage class to body for CSS background/overlay
  useEffect(() => {
    if (mounted && isHomePage) {
      document.body.classList.add('homepage');
    } else {
      document.body.classList.remove('homepage');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('homepage');
    };
  }, [mounted, isHomePage]);

  const handleSidebarItemClick = (type: 'project' | 'case_study' | 'blog') => {
    console.log('Sidebar item clicked:', type);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // If it's an admin page, don't render the main navigation
  if (isAdminPage) {
    return <>{children}</>;
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isContentPage || isHomePage ? 'min-h-screen' : 'h-screen overflow-hidden'} relative`}>
      {/* All content positioned above CSS background/overlay */}
      <div className="relative z-30">
        <Navbar />

        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
          onItemClick={handleSidebarItemClick}
        />

        <div className={`${isContentPage ? '' : 'pt-32 px-8'} transition-all duration-500 ease-out`}>
          {children}
        </div>
      </div>
    </div>
  );
}
