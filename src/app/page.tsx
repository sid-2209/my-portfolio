"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ContentGrid from "../components/ContentGrid";

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<'project' | 'case_study' | 'blog' | null>(null);

  const handleSidebarItemClick = (type: 'project' | 'case_study' | 'blog') => {
    setSelectedContentType(type);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#678dc6] to-[#FFFFFF]">
      <Navbar />
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        onItemClick={handleSidebarItemClick}
      />

      {/* Main Content - Work Section */}
      <div className="pt-32 px-8 transition-all duration-500 ease-out">
        <div className="max-w-4xl mx-auto">
          {/* Content Grid */}
          <ContentGrid contentType={selectedContentType} />
        </div>
      </div>
    </div>
  );
}
