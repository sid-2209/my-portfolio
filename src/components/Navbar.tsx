'use client';

import { useState } from "react";
import Link from "next/link";
import NavigationLink from "./ui/NavigationLink";
import SearchBar from "./ui/SearchBar";
import GlassmorphismContainer from "./ui/GlassmorphismContainer";
import GlassmorphismButton from "./ui/GlassmorphismButton";
import { SearchIcon, LinkedInIcon, InstagramIcon, GitHubIcon } from "./ui/Icons";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (query: string) => {
    // TODO: Implement search functionality
    console.log('Searching for:', query);
    setIsSearchOpen(false);
  };

  return (
    <>
      {/* Fixed Project Title - Top Left Corner, Vertically Centered with Navbar */}
      <div className="fixed top-0 left-8 z-50 flex items-center h-20">
        <Link href="/" className="michroma text-white/90 text-2xl font-bold tracking-wide hover:text-white transition-colors duration-300 cursor-pointer block">
          Sid&apos;s Notes
        </Link>
      </div>

      {/* Main Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex justify-center items-center py-4">
        <GlassmorphismContainer variant="navbar" className="px-12 py-3 transition-all duration-1200 ease-out">
          <div className="flex items-center space-x-12">
            <NavigationLink href="/">
              Home
            </NavigationLink>
            <NavigationLink href="/about">
              About
            </NavigationLink>
            <GlassmorphismButton
              onClick={() => setIsSearchOpen(true)}
              size="md"
              className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105"
            >
              <SearchIcon size={16} />
            </GlassmorphismButton>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.linkedin.com/in/realsiddhartha/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <LinkedInIcon size={16} />
              </a>
              <a 
                href="https://www.instagram.com/in/realsiddhartha/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <InstagramIcon size={16} />
              </a>
              <a 
                href="https://github.com/sid-2209" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <GitHubIcon size={16} />
              </a>
            </div>
          </div>
        </GlassmorphismContainer>
      </nav>

      {/* Bottom Search Bar */}
      <SearchBar 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
    </>
  );
}
