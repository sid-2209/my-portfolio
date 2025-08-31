'use client';

import { useState } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  initialWidth?: string;
  focusWidth?: string;
}

export default function SearchInput({ 
  placeholder = "Search...", 
  onSearch, 
  className = '',
  initialWidth = 'w-32',
  focusWidth = 'w-40'
}: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder} 
        className={`backdrop-blur-[2px] bg-white/35 border border-white/50 rounded-full px-4 py-2 text-white placeholder-white/90 text-sm focus:outline-none focus:border-white/70 focus:bg-white/45 transition-all duration-300 ${initialWidth} focus:${focusWidth} ${className}`}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/90">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
    </form>
  );
}
