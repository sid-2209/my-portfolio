'use client';

import GlassmorphismContainer from "./ui/GlassmorphismContainer";
import GlassmorphismButton from "./ui/GlassmorphismButton";
import { ChevronLeftIcon, ProjectsIcon, CaseStudiesIcon, BlogIcon } from "./ui/Icons";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onItemClick: (type: 'project' | 'case_study' | 'blog') => void;
}

export default function Sidebar({ isCollapsed, onToggle, onItemClick }: SidebarProps) {
  return (
    <div className={`fixed left-8 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-1200 ease-out ${isCollapsed ? 'w-20' : 'w-48'}`}>
      <GlassmorphismContainer variant="sidebar" className="px-6 py-8 transition-all duration-1200 ease-out group h-64 relative">
        {/* Collapse Button */}
        <GlassmorphismButton
          onClick={onToggle}
          size="sm"
          className="absolute -top-2 -right-2 z-20 group-hover:scale-110"
        >
          <ChevronLeftIcon size={14} className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </GlassmorphismButton>
        
        <div className="flex flex-col justify-center h-full">
          <div className="space-y-12">
            <a 
              href="#projects" 
              className="relative flex items-center space-x-4 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('project')}
            >
              <ProjectsIcon size={18} className="text-white/80 group-hover/item:text-white transition-colors duration-300 flex-shrink-0" />
              <span className={`absolute left-10 font-medium transition-all duration-1200 ease-out michroma ${isCollapsed ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>Projects</span>
            </a>
            
            <a 
              href="#case-studies" 
              className="relative flex items-center space-x-4 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('case_study')}
            >
              <CaseStudiesIcon size={18} className="text-white/80 group-hover/item:text-white transition-colors duration-300 flex-shrink-0" />
              <span className={`absolute left-10 font-medium transition-all duration-1200 ease-out michroma ${isCollapsed ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>Case Studies</span>
            </a>
            
            <a 
              href="#blog" 
              className="relative flex items-center space-x-4 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('blog')}
            >
              <BlogIcon size={18} className="text-white/80 group-hover/item:text-white transition-colors duration-300 flex-shrink-0" />
              <span className={`absolute left-10 font-medium transition-all duration-1200 ease-out michroma ${isCollapsed ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>Blog</span>
            </a>
          </div>
        </div>
      </GlassmorphismContainer>
    </div>
  );
}
