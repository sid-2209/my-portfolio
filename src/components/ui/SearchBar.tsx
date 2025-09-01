'use client';

import { useState } from 'react';
import GlassmorphismButton from './GlassmorphismButton';
import GlassmorphismContainer from './GlassmorphismContainer';
import { SearchIcon, CloseIcon } from './Icons';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  isOpen, 
  onClose, 
  onSearch, 
  placeholder = "Ask anything!" 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6">
      <div className="max-w-2xl mx-auto relative">
        <GlassmorphismButton
          onClick={onClose}
          size="md"
          className="absolute -left-12 top-1/2 transform -translate-y-1/2"
        >
          <CloseIcon size={16} />
        </GlassmorphismButton>
        
        <form onSubmit={handleSubmit} className="relative">
          <GlassmorphismContainer variant="search" className="w-full">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder} 
              className="w-full michroma bg-transparent border-none px-6 py-4 text-white placeholder-white/90 text-lg focus:outline-none transition-all duration-500"
              autoFocus
            />
          </GlassmorphismContainer>
        </form>
        
        <GlassmorphismButton
          onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          size="md"
          type="submit"
          className="absolute -right-12 top-1/2 transform -translate-y-1/2"
        >
          <SearchIcon size={16} />
        </GlassmorphismButton>
      </div>
    </div>
  );
}
