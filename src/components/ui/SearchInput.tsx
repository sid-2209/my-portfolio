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
        className={`backdrop-blur-[20px] bg-gradient-to-r from-white/[0.12] via-white/[0.08] via-white/[0.04] via-white/[0.08] to-white/[0.12] border border-white/[0.25] rounded-full px-4 py-2 text-white placeholder-white/90 text-sm focus:outline-none focus:border-white/[0.35] focus:from-white/[0.18] focus:via-white/[0.12] focus:via-white/[0.06] focus:via-white/[0.12] focus:to-white/[0.18] transition-all duration-500 ${initialWidth} focus:${focusWidth} ${className} shadow-[0_4px_16px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.3),0_0_15px_rgba(255,255,255,0.02)] focus:shadow-[0_6px_20px_rgba(0,0,0,0.8),0_3px_8px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.04)]`}
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
