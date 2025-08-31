export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#678dc6] to-[#FFFFFF]">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-4">
        <div className="backdrop-blur-[2px] bg-white/15 border border-white/40 rounded-full px-8 py-3 shadow-[0_4px_20px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-500 ease-out">
          <div className="flex items-center space-x-12">
            <a href="/" className="text-white/90 hover:text-white font-medium text-base transition-all duration-300 hover:scale-105">
              Work
            </a>
            <a href="#about-me" className="text-white/90 hover:text-white font-medium text-base transition-all duration-300 hover:scale-105">
              About Me
            </a>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="backdrop-blur-[2px] bg-white/35 border border-white/50 rounded-full px-4 py-2 text-white placeholder-white/90 text-sm focus:outline-none focus:border-white/70 focus:bg-white/45 transition-all duration-300 w-32 focus:w-40"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/90">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
