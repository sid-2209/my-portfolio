"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import VoidBloomToggle from "../components/VoidBloomToggle";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";

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
  const isCollaboratePage = pathname === '/collaborate';

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Apply page-specific classes to body for CSS background/overlay
  useEffect(() => {
    if (mounted) {
      // Remove all page classes first
      document.body.classList.remove('homepage', 'projects-page', 'case-studies-page', 'notes-page', 'about-page', 'collaborate-page', 'content-page');

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
      } else if (isCollaboratePage) {
        document.body.classList.add('collaborate-page');
      } else if (isContentPage) {
        document.body.classList.add('content-page');
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('homepage', 'projects-page', 'case-studies-page', 'notes-page', 'about-page', 'collaborate-page', 'content-page');
    };
  }, [mounted, isHomePage, isProjectsPage, isCaseStudiesPage, isNotesPage, isAboutPage, isCollaboratePage, isContentPage]);

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
    <ThemeProvider>
      <LayoutContent
        isSidebarCollapsed={isSidebarCollapsed}
        handleSidebarToggle={handleSidebarToggle}
        handleSidebarItemClick={handleSidebarItemClick}
        pathname={pathname}
        isContentPage={isContentPage}
      >
        {children}
      </LayoutContent>
    </ThemeProvider>
  );
}

// Inner component that can access ThemeContext
function LayoutContent({
  children,
  isSidebarCollapsed,
  handleSidebarToggle,
  handleSidebarItemClick,
  pathname,
  isContentPage,
}: {
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
  handleSidebarToggle: () => void;
  handleSidebarItemClick: (type: 'project' | 'case_study' | 'blog') => void;
  pathname: string | null;
  isContentPage: boolean;
}) {
  const { backgroundOpacity } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inject CSS variable for background opacity
  useEffect(() => {
    if (mounted) {
      // Calculate actual opacity value (0.33 to 1.0)
      const opacityValue = 0.33 + (backgroundOpacity * 0.134);

      // Inject CSS variable into document root
      document.body.style.setProperty('--bg-overlay-opacity', opacityValue.toString());
    }
  }, [backgroundOpacity, mounted]);

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* All content positioned above CSS background/overlay */}
      <div className="relative z-20 flex flex-col min-h-screen">
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

        {/* Void/Bloom Toggle - Bottom Right Corner */}
        <VoidBloomToggle />

        {/* Footer - visible on all pages */}
        <Footer />
      </div>
    </div>
  );
}
