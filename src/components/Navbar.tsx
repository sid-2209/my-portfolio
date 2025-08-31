'use client';

import Link from "next/link";
import SearchInput from "./ui/SearchInput";

export default function Navbar() {
  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Searching for:', query);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-4">
      <div className="backdrop-blur-[2px] bg-white/15 border border-white/40 rounded-full px-8 py-3 shadow-[0_4px_20px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-500 ease-out">
        <div className="flex items-center space-x-12">
          <Link href="/" className="michroma text-white/90 hover:text-white font-medium text-base transition-all duration-300 hover:scale-105">
            Work
          </Link>
          <a href="#about-me" className="michroma text-white/90 hover:text-white font-medium text-base transition-all duration-300 hover:scale-105">
            About Me
          </a>
          <SearchInput 
            placeholder="Search..." 
            onSearch={handleSearch}
            initialWidth="w-32"
            focusWidth="w-40"
          />
        </div>
      </div>
    </nav>
  );
}
