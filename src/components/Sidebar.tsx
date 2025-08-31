'use client';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onItemClick: (type: 'project' | 'case_study' | 'blog') => void;
}

export default function Sidebar({ isCollapsed, onToggle, onItemClick }: SidebarProps) {
  return (
    <div className={`fixed left-8 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-1200 ease-out ${isCollapsed ? 'w-20' : 'w-48'}`}>
      <div className="backdrop-blur-[20px] bg-gradient-to-b from-white/[0.15] via-white/[0.08] via-white/[0.04] via-white/[0.08] to-white/[0.15] border border-white/[0.2] rounded-2xl px-6 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_2px_8px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_25px_rgba(255,255,255,0.03),0_0_50px_rgba(255,255,255,0.01)] transition-all duration-1200 ease-out group h-64 relative">
        {/* Collapse Button */}
        <button 
          onClick={onToggle}
          className="absolute -top-2 -right-2 w-7 h-7 backdrop-blur-[20px] bg-gradient-to-br from-white/[0.35] via-white/[0.25] via-white/[0.15] to-white/[0.05] border border-white/[0.3] rounded-full flex items-center justify-center text-white/90 hover:text-white transition-all duration-800 group-hover:scale-110 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),0_0_15px_rgba(255,255,255,0.03),0_0_30px_rgba(255,255,255,0.01)] z-20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        
        <div className="flex flex-col justify-center h-full">
          <div className="space-y-12">
            <a 
              href="#projects" 
              className="relative flex items-center space-x-4 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('project')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover/item:text-white transition-colors duration-300 flex-shrink-0">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span className={`absolute left-10 font-medium transition-all duration-1200 ease-out michroma ${isCollapsed ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>Projects</span>
            </a>
            
            <a 
              href="#case-studies" 
              className="relative flex items-center space-x-4 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('case_study')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover/item:text-white transition-colors duration-300 flex-shrink-0">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span className={`absolute left-10 font-medium transition-all duration-1200 ease-out michroma ${isCollapsed ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>Case Studies</span>
            </a>
            
            <a 
              href="#blog" 
              className="relative flex items-center space-x-4 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('blog')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover/item:text-white transition-colors duration-300 flex-shrink-0">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span className={`absolute left-10 font-medium transition-all duration-1200 ease-out michroma ${isCollapsed ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>Blog</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
