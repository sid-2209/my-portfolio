"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleSidebarItemClick = (type: 'project' | 'case_study' | 'blog') => {
    // TODO: Handle sidebar item clicks for new design
    console.log('Sidebar item clicked:', type);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        onItemClick={handleSidebarItemClick}
      />

      {/* Main Content Area - Ready for new design */}
      <div className="pt-32 px-8 transition-all duration-500 ease-out">
        <div className="max-w-7xl mx-auto">
          {/* Your new content will go here */}
        </div>
      </div>
    </div>
  );
}
