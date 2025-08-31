'use client';

import Link from "next/link";
import SearchInput from "./ui/SearchInput";

export default function Navbar() {
  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Searching for:', query);
  };

  return (
    <>
      {/* Fixed Project Title - Top Left Corner, Vertically Centered with Navbar */}
      <div className="fixed top-0 left-8 z-50 flex items-center h-20">
        <h1 className="michroma text-white/90 text-2xl font-bold tracking-wide hover:text-white transition-colors duration-300">
          Sid's Notes
        </h1>
      </div>

      {/* Main Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-4">
        <div className="backdrop-blur-[20px] bg-gradient-to-r from-white/[0.15] via-white/[0.08] via-white/[0.04] via-white/[0.08] to-white/[0.15] border border-white/[0.2] rounded-full px-8 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_2px_8px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_0_rgba(0,0,0,0.5),0_0_25px_rgba(255,255,255,0.03),0_0_50px_rgba(255,255,255,0.01)] transition-all duration-1200 ease-out">
          <div className="flex items-center space-x-12">
            <Link href="/" className="michroma text-white/90 hover:text-white font-medium text-base transition-all duration-300 hover:scale-105">
              Home
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
    </>
  );
}
