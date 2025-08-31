"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HomePageLayout from "../components/HomePageLayout";
import { Content } from "../lib/db";

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<'project' | 'case_study' | 'blog' | null>(null);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/content');
        if (response.ok) {
          const data = await response.json();
          setAllContent(data);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSidebarItemClick = (type: 'project' | 'case_study' | 'blog') => {
    setSelectedContentType(type);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Organize content into sections
  const featuredContent = allContent.find(content => content.featured) || allContent[0] || null;
  const secondaryPosts = allContent.filter(content => 
    content.id !== featuredContent?.id
  ).slice(0, 3);
  const tertiaryPosts = allContent.filter(content => 
    content.id !== featuredContent?.id && 
    !secondaryPosts.find(sec => sec.id === content.id)
  );

  return (
    <div className="min-h-screen bg-[#000000]">
      <Navbar />
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        onItemClick={handleSidebarItemClick}
      />

      {/* Main Content - Work Section */}
      <div className="pt-32 px-8 transition-all duration-500 ease-out">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <HomePageLayout 
              featuredContent={featuredContent}
              secondaryPosts={secondaryPosts}
              tertiaryPosts={tertiaryPosts}
            />
          )}
        </div>
      </div>
    </div>
  );
}
