"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import GlassmorphismBox from "../components/ui/GlassmorphismBox";
import CircularRing from "../components/ui/CircularRing";
import GlassmorphismButton from "../components/ui/GlassmorphismButton";
import { ChevronRightIcon } from "../components/ui/Icons";

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
    <div className="h-screen overflow-hidden">
      <Navbar />
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        onItemClick={handleSidebarItemClick}
      />

      {/* Main Content Area - Ready for new design */}
      <div className="pt-32 px-8 transition-all duration-500 ease-out">
        <div className="max-w-7xl mx-auto">
          {/* Post 4 */}
          <div className="flex justify-end items-end min-h-[60vh] pb-2 pr-20 relative">
            <GlassmorphismBox 
              variant="post" 
              className="p-8 w-96 h-64 flex flex-col justify-center items-center"
            >
              <h2 className="michroma text-white/90 text-2xl font-bold mb-4">
                Post 4
              </h2>
              <p className="text-white/80 text-center mb-6">
                This is Post 4 content that demonstrates how the glassmorphism box will look with actual content.
              </p>
              <div className="flex space-x-4">
                <span className="text-white/60 text-sm">AI & TECHNOLOGY</span>
                <span className="text-white/60 text-sm">SEP 1</span>
              </div>
            </GlassmorphismBox>
            <div className="absolute -bottom-2 left-200.5 z-10">
              <CircularRing size="sm" />
            </div>
          </div>

          {/* Post 3 */}
          <div className="flex justify-end items-start min-h-[60vh] -mt-106 pr-135">
            <GlassmorphismBox 
              variant="post" 
              className="p-8 w-96 h-64 flex flex-col justify-center items-center"
            >
              <h2 className="michroma text-white/90 text-2xl font-bold mb-4">
                Post 3
              </h2>
              <p className="text-white/80 text-center mb-6">
                This is Post 3 content that demonstrates how the glassmorphism box will look with actual content.
              </p>
              <div className="flex space-x-4">
                <span className="text-white/60 text-sm">AI & TECHNOLOGY</span>
                <span className="text-white/60 text-sm">SEP 1</span>
              </div>
            </GlassmorphismBox>
            <div className="absolute bottom-143 left-245 z-10">
              <CircularRing size="sm" />
            </div>
          </div>

          {/* Post 2 */}
          <div className="flex justify-start items-start min-h-[60vh] -mt-143 -ml-64">
            <GlassmorphismBox 
              variant="post" 
              className="p-8 w-96 h-64 flex flex-col justify-center items-center"
            >
              <h2 className="michroma text-white/90 text-2xl font-bold mb-4">
                Post 2
              </h2>
              <p className="text-white/80 text-center mb-6">
                This is Post 2 content that demonstrates how the glassmorphism box will look with actual content.
              </p>
              <div className="flex space-x-4">
                <span className="text-white/60 text-sm">AI & TECHNOLOGY</span>
                <span className="text-white/60 text-sm">SEP 1</span>
              </div>
            </GlassmorphismBox>
            <div className="absolute bottom-145 left-187 z-10">
              <CircularRing size="sm" />
            </div>            
          </div>



          {/* Post 1 */}
          <div className="flex justify-center items-start min-h-[60vh] -mt-345 -ml-218">
            <GlassmorphismBox 
              variant="post" 
              className="p-8 w-96 h-64 flex flex-col justify-center items-center"
            >
              <h2 className="michroma text-white/90 text-2xl font-bold mb-4">
                Post 1
              </h2>
              <p className="text-white/80 text-center mb-6">
                This is Post 1 content that demonstrates how the glassmorphism box will look with actual content.
              </p>
              <div className="flex space-x-4">
                <span className="text-white/60 text-sm">AI & TECHNOLOGY</span>
                <span className="text-white/60 text-sm">SEP 1</span>
              </div>
            </GlassmorphismBox>
            <div className="absolute bottom-257 left-159 z-10">
              <CircularRing size="sm" />
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-center items-center absolute bottom-18 right-35 z-20">
            <GlassmorphismButton
              onClick={() => console.log('Next clicked')}
              size="xl"
              className="text-white/90 hover:text-white transition-all duration-300"
            >
              <ChevronRightIcon size={24} />
            </GlassmorphismButton>
          </div>
        </div>
      </div>
    </div>
  );
}
