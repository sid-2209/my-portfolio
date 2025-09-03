"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [backgroundApplied, setBackgroundApplied] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if we're on admin pages or content pages
  const isAdminPage = pathname?.startsWith('/admin');
  const isContentPage = pathname?.startsWith('/content/');

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply background styles after mount to prevent hydration mismatch
  useEffect(() => {
    if (mounted && containerRef.current && !isAdminPage) {
      const container = containerRef.current;
      container.style.backgroundImage = 'url(/images/pixeliota-nLbMbYVmeD0-unsplash (1).svg)';
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      container.style.backgroundRepeat = 'no-repeat';
      setBackgroundApplied(true);
    }
  }, [mounted, isAdminPage]);

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
    <div 
      ref={containerRef}
      className={`${isContentPage ? 'min-h-screen' : 'h-screen overflow-hidden'}`}
    >
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
  );
}
