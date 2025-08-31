'use client';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onItemClick: (type: 'project' | 'case_study' | 'blog') => void;
}

export default function Sidebar({ isCollapsed, onToggle, onItemClick }: SidebarProps) {
  return (
    <div className={`fixed left-8 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-500 ease-out ${isCollapsed ? 'w-20' : 'w-48'}`}>
      <div className="backdrop-blur-[2px] bg-white/15 border border-white/40 rounded-2xl px-6 py-8 shadow-[0_4px_20px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-500 ease-out group h-64">
        {/* Collapse Button */}
        <button 
          onClick={onToggle}
          className="absolute -right-3 top-4 w-6 h-6 backdrop-blur-[2px] bg-white/35 border border-white/50 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/45 hover:border-white/70 transition-all duration-300 group-hover:scale-110 shadow-lg"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        
        <div className="flex flex-col justify-center h-full">
          <div className="space-y-8">
            <a 
              href="#projects" 
              className="relative flex items-center space-x-3 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('project')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover/item:text-white transition-colors duration-300">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span className={`absolute left-8 font-medium transition-all duration-300 michroma ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>Projects</span>
            </a>
            
            <a 
              href="#case-studies" 
              className="relative flex items-center space-x-3 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('case_study')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover/item:text-white transition-colors duration-300">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span className={`absolute left-8 font-medium transition-all duration-300 michroma ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>Case Studies</span>
            </a>
            
            <a 
              href="#blog" 
              className="relative flex items-center space-x-3 text-white/90 hover:text-white transition-all duration-300 hover:scale-105 group/item"
              onClick={() => onItemClick('blog')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80 group-hover/item:text-white transition-colors duration-300">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span className={`absolute left-8 font-medium transition-all duration-300 michroma ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>Blog</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
