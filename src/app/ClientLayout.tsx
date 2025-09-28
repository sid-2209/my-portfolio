"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

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
  const isProjectsPage = pathname === '/projects';
  const isCaseStudiesPage = pathname === '/case-studies';
  const isNotesPage = pathname === '/notes';
  const isAboutPage = pathname === '/about';

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply page-specific classes to body for CSS background/overlay
  useEffect(() => {
    if (mounted) {
      // Remove all page classes first
      document.body.classList.remove('homepage', 'projects-page', 'case-studies-page', 'notes-page', 'about-page');

      // Add appropriate class based on current page
      if (isHomePage) {
        document.body.classList.add('homepage');
      } else if (isProjectsPage) {
        document.body.classList.add('projects-page');
      } else if (isCaseStudiesPage) {
        document.body.classList.add('case-studies-page');
      } else if (isNotesPage) {
        document.body.classList.add('notes-page');
      } else if (isAboutPage) {
        document.body.classList.add('about-page');
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('homepage', 'projects-page', 'case-studies-page', 'notes-page', 'about-page');
    };
  }, [mounted, isHomePage, isProjectsPage, isCaseStudiesPage, isNotesPage, isAboutPage]);

  const handleSidebarItemClick = (type: 'project' | 'case_study' | 'blog') => {
    switch (type) {
      case 'project':
        window.location.href = '/projects';
        break;
      case 'case_study':
        window.location.href = '/case-studies';
        break;
      case 'blog':
        window.location.href = '/notes';
        break;
      default:
        console.log('Sidebar item clicked:', type);
    }
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
    <div className="min-h-screen relative flex flex-col">
      {/* All content positioned above CSS background/overlay */}
      <div className="relative z-30 flex flex-col min-h-screen">
        <Navbar />

        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
          onItemClick={handleSidebarItemClick}
          currentPath={pathname}
        />

        <div className={`${isContentPage ? 'flex-1' : 'flex-1 pt-32 px-8'} transition-all duration-500 ease-out`}>
          {children}
        </div>

        {/* Footer - visible on all pages */}
        <Footer />
      </div>
    </div>
  );
}
