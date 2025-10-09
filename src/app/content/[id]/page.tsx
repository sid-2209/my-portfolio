"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BlockType, Prisma } from "@prisma/client";
import GlassmorphismContainer from "../../../components/ui/GlassmorphismContainer";
import BlockRenderer from "../../../components/cms/BlockRenderer";
import ScrollProgressIndicator from "../../../components/ui/ScrollProgressIndicator";
import { useDynamicSections } from "../../../hooks/useDynamicSections";
import SharePost from "../../../components/ui/SharePost";
import ScrollFadeContainer from "../../../components/ui/ScrollFadeContainer";
import { useTheme } from "../../../contexts/ThemeContext";

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
  const { fadeEnabled } = useTheme();
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

  // Generate dynamic sections based on content blocks and dividers
  // Must be called before conditional returns to follow Rules of Hooks
  const dynamicSections = useDynamicSections(content?.contentBlocks, content?.title || '');

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white/60 text-lg">Loading post...</div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="text-white/60 text-lg">Post not found</div>
      </div>
    );
  }

  // Helper function to detect if URL is a video
  const isVideoUrl = (url: string): boolean => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url) ||
           url.includes('video/');
  };

  return (
    <div className="relative w-full">
      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator sections={dynamicSections} />

      {/* Hero Section - Two Panel Layout */}
      <div id="hero" className="relative w-full h-screen overflow-hidden">
        {/* Two-Panel Content Layout */}
        <div className="relative w-full h-full flex flex-col lg:flex-row">
          {/* LEFT PANEL - Hero Featured Image */}
          <div className="w-full lg:w-1/2 h-[50vh] lg:h-full relative">
            {/* Gradient Border - Top, Left, Bottom */}
            <div
              className="absolute top-0 left-0 bottom-0 w-full h-full pointer-events-none"
              style={{
                background: 'linear-gradient(0.25turn, #f1a7b1, #f3c6b4, #f5e7c2, #b7e1b7, #87c4e3)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                padding: '10px 0 10px 10px'
              }}
            />

            {content.imageUrl ? (
              isVideoUrl(content.imageUrl) ? (
                <video
                  src={content.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-indigo-900/50" />
            )}
          </div>

          {/* RIGHT PANEL - Fully Transparent Content */}
          <div className="w-full lg:w-1/2 min-h-[50vh] lg:h-full relative flex items-center p-8 lg:pl-12 lg:pr-16">
            {/* Content Container - No background, no gradient */}
            <div className="relative z-10 w-full">
              {/* Category and Type Badges */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-white/90 text-sm font-medium px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  {content.contentType}
                </span>
                {content.category && (
                  <span className="text-white/90 text-sm font-medium px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    {content.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="michroma text-white text-3xl md:text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                {content.title}
              </h1>

              {/* Description/Excerpt */}
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8">
                {content.description}
              </p>

              {/* Date, Author, and Share */}
              <div className="flex items-center justify-between gap-6 text-white/70 text-sm md:text-base">
                {/* Left: Date and Author */}
                <div className="flex items-center gap-6">
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

                {/* Right: Share Icon */}
                <SharePost
                  postId={content.id}
                  postTitle={content.title}
                  size={20}
                  className="text-white/70 hover:text-white/90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div id="content-start" className="w-full scroll-mt-20">
        <div className="max-w-4xl mx-auto px-8 py-16 overflow-visible">
          {/* Main Content Area - CMS Blocks */}
          <div className="prose prose-invert max-w-none overflow-visible">
            {/* CMS Content Blocks */}
            {content.contentBlocks && content.contentBlocks.length > 0 ? (
              <ScrollFadeContainer fadeStart={120} fadeDistance={200} enabled={fadeEnabled}>
                <BlockRenderer blocks={content.contentBlocks.map(block => ({
                  ...block,
                  contentId: content.id,
                  createdAt: new Date(content.createdAt),
                  updatedAt: new Date(content.updatedAt),
                  blockType: block.blockType as BlockType,
                  data: block.data as Prisma.JsonValue
                }))} />
              </ScrollFadeContainer>
            ) : (
            /* Show message when no CMS blocks */
            <div className="text-center py-16">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-white/90 text-xl md:text-2xl font-semibold mb-4">Content Coming Soon</h3>
                <p className="text-white/70 text-lg leading-relaxed mb-2">
                  This post is currently being prepared with rich content blocks.
                </p>
                <p className="text-white/60 text-base">
                  Check back soon for the full content experience.
                </p>
              </div>
            </div>
          )}
          </div>

          {/* Tags & Footer Section */}
          {content.tags.length > 0 && (
            <div id="tags-footer" className="pt-12 mt-16 scroll-mt-20">
              {/* Tags divider using MinimalistDivider style */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent mb-12" />
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

    </div>
  );
}
