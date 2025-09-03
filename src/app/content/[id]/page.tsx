"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BlockType, Prisma } from "@prisma/client";
import GlassmorphismContainer from "../../../components/ui/GlassmorphismContainer";
import BlockRenderer from "../../../components/cms/BlockRenderer";

interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  category?: string | null;
  featured?: boolean;
  posterImage?: string | null;
  imageUrl?: string | null;
  contentUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status?: string;
  slug?: string;
  contentBlocks?: { id: string; blockType: string; data: unknown; order: number }[];
}

export default function ContentPage() {
  const params = useParams();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/content/${params.id}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchContent();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-white/60 text-lg">Loading post...</div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="text-white/60 text-lg">Post not found</div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#0d0d0d]">
      {/* Hero Section - Full Viewport */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Hero Image */}
        {content.imageUrl ? (
          <img 
            src={content.imageUrl} 
            alt={content.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-indigo-900/50" />
        )}
        
        {/* Dark Overlay for Better Readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Glassmorphism Container - Positioned at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
          <GlassmorphismContainer 
            variant="content"
            className="max-w-6xl mx-auto p-8 backdrop-blur-[25px] bg-white/[0.15] border-white/[0.25] rounded-2xl"
          >
            {/* Category and Type Badges */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-white/80 text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                {content.contentType}
              </span>
              {content.category && (
                <span className="text-white/80 text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                  {content.category}
                </span>
              )}
              {content.status && (
                <span className={`text-sm px-4 py-2 rounded-full backdrop-blur-sm border ${
                  content.status === 'PUBLISHED' ? 'text-green-300 bg-green-500/20 border-green-500/30' :
                  content.status === 'DRAFT' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' :
                  'text-gray-300 bg-gray-500/20 border-gray-500/30'
                }`}>
                  {content.status}
                </span>
              )}
            </div>
            
            {/* Title */}
            <h1 className="michroma text-white text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {content.title}
            </h1>
            
            {/* Date and Author */}
            <div className="flex items-center gap-6 text-white/80 text-lg">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                {new Date(content.publishedDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white/60 rounded-full"></span>
                By {content.author}
              </span>
            </div>
          </GlassmorphismContainer>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto px-8 py-16">
          {/* Main Content Area - CMS Blocks */}
          <div className="prose prose-invert max-w-none">
            {/* CMS Content Blocks */}
            {content.contentBlocks && content.contentBlocks.length > 0 ? (
              <BlockRenderer blocks={content.contentBlocks.map(block => ({
                ...block,
                contentId: content.id,
                createdAt: new Date(content.createdAt),
                updatedAt: new Date(content.updatedAt),
                blockType: block.blockType as BlockType,
                data: block.data as Prisma.JsonValue
              }))} />
            ) : (
              /* Fallback to description if no CMS blocks */
              <div className="text-center py-12">
                <div className="mb-8">
                  <p className="text-white/90 text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto">
                    {content.description}
                  </p>
                </div>
                <div className="text-white/60 text-lg">
                  <p>This post doesn&apos;t have any content blocks yet.</p>
                  <p className="mt-2 text-sm">Content will be displayed here once CMS blocks are added.</p>
                </div>
              </div>
            )}
          </div>

          {/* Tags Section */}
          {content.tags.length > 0 && (
            <div className="pt-12 border-t border-white/10 mt-16">
              <h3 className="text-white/90 text-xl font-semibold mb-6 text-center">Related Tags</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {content.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-white/70 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Transparent with #0d0d0d backdrop */}
      <footer className="w-full bg-[#0d0d0d]/90 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div>
              <h3 className="michroma text-white text-xl font-bold mb-4">Sid&apos;s Notes</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Exploring the intersection of technology, creativity, and innovation. 
                Sharing insights on development, design, and digital experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white/90 text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#about-me" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                    About Me
                  </a>
                </li>
                <li>
                  <a href="#projects" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                    Projects
                  </a>
                </li>
                <li>
                  <a href="#notes" className="text-white/70 hover:text-white transition-colors duration-300 text-sm">
                    Notes
                  </a>
                </li>
              </ul>
            </div>

            {/* Social & Contact */}
            <div>
              <h4 className="text-white/90 text-lg font-semibold mb-4">Connect</h4>
              <div className="space-y-2">
                <a 
                  href="https://www.linkedin.com/in/realsiddhartha/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 text-sm"
                >
                  <span>LinkedIn</span>
                </a>
                <a 
                  href="https://github.com/sid-2209" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 text-sm"
                >
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} Sid&apos;s Notes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
