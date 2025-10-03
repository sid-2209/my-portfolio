"use client";

import { useState, useEffect } from "react";
import BlockBuilder from "./BlockBuilder";
import { BlockType } from "@prisma/client";
import TagInput from "../forms/TagInput";
import ImagePicker from "../media/ImagePicker";

// Block data interfaces
interface ParagraphData { text: string; }
interface HeadingData { text: string; level: number; }
interface ImageData { src: string; alt: string; caption?: string; }
interface CodeBlockData { code: string; language: string; }
interface QuoteData { text: string; author?: string; source?: string; }
interface ListData { type: 'unordered' | 'ordered'; items: string[]; }
interface DividerData { style: 'solid' | 'dashed' | 'dotted' | 'double'; color: string; }
interface CustomData { html: string; containerStyle?: 'default' | 'transparent' | 'outlined' | 'minimal'; showBackground?: boolean; showBorder?: boolean; showPadding?: boolean; showRounding?: boolean; }
type BlockData = ParagraphData | HeadingData | ImageData | CodeBlockData | QuoteData | ListData | DividerData | CustomData;

interface Content {
  id: string;
  title: string;
  description: string;
  contentType: string;
  category?: string | null;
  featured: boolean;
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
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishDate?: string;
  readingTime?: number;
}

interface EnhancedContentEditorProps {
  content: Content;
  onSave: (content: Content) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function EnhancedContentEditor({ 
  content, 
  onSave, 
  onCancel, 
  isEditing = false 
}: EnhancedContentEditorProps) {
  const [formData, setFormData] = useState<Content>(content);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'publish' | 'blocks'>('content');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Auto-generate reading time based on content blocks
      const totalWords = (formData.contentBlocks || []).reduce((acc, block) => {
        if (block.blockType === 'PARAGRAPH' && (block.data as { text?: string })?.text) {
          return acc + (block.data as { text: string }).text.split(' ').length;
        }
        if (block.blockType === 'HEADING' && (block.data as { text?: string })?.text) {
          return acc + (block.data as { text: string }).text.split(' ').length;
        }
        return acc;
      }, 0);
      
      const readingTime = Math.ceil(totalWords / 200); // Average reading speed
      
      const updatedContent = {
        ...formData,
        readingTime,
        updatedAt: new Date().toISOString()
      };
      
      await onSave(updatedContent);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentBlocksChange = (blocks: { id: string; blockType: string; data: unknown; order: number }[]) => {
    setFormData(prev => ({ ...prev, contentBlocks: blocks }));
  };

  const tabs = [
    { 
      id: 'content', 
      label: 'Content', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'seo', 
      label: 'SEO', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      id: 'publish', 
      label: 'Publish', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'blocks', 
      label: 'Blocks', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Content' : 'Create New Content'}
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.title}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'content' | 'seo' | 'publish' | 'blocks')}
              className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2 flex items-center">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter content title"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Content Type</label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="blog">Blog Post</option>
                  <option value="project">Project</option>
                  <option value="case_study">Case Study</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="news">News</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
                <span className="text-gray-500 font-normal ml-1">(Optional - Short excerpt for listings)</span>
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-24 resize-none"
                placeholder="Optional: Brief description for homepage and listing pages"
              />
              <p className="text-sm text-gray-500 mt-1">This will be used as a short excerpt on listing pages. Leave empty if not needed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Author name"
                />
              </div>
              <div>
                <ImagePicker
                  label="Featured Image"
                  value={formData.imageUrl || ''}
                  onChange={(media) => setFormData(prev => ({ ...prev, imageUrl: media?.blobUrl || '' }))}
                  onUrlChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  source="content"
                  contentId={formData.id}
                  folder="content"
                  placeholder="No featured image selected"
                />
              </div>
            </div>

            <TagInput
              label="Tags"
              value={formData.tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
              placeholder="Enter tags separated by commas"
              maxTags={10}
            />
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-2">SEO Optimization</h3>
              <p className="text-gray-700 text-sm">Optimize your content for search engines and social media sharing.</p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">SEO Title</label>
              <input
                type="text"
                value={formData.seoTitle || formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="SEO optimized title"
              />
              <p className="text-sm text-gray-500 mt-1">Recommended length: 50-60 characters</p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">SEO Description</label>
              <textarea
                value={formData.seoDescription || formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 h-20 resize-none"
                placeholder="SEO optimized description (defaults to description or title if empty)"
              />
              <p className="text-sm text-gray-500 mt-1">Recommended length: 150-160 characters</p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">SEO Keywords</label>
              <input
                type="text"
                value={formData.seoKeywords || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Enter SEO keywords separated by commas"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="URL-friendly slug"
              />
              <p className="text-sm text-gray-500 mt-1">Leave empty to auto-generate from title</p>
            </div>
          </div>
        )}

        {activeTab === 'publish' && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-gray-900 font-medium mb-2">Publishing Options</h3>
              <p className="text-gray-700 text-sm">Control when and how your content is published.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status || 'DRAFT'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Review</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Publish Date</label>
                <input
                  type="datetime-local"
                  value={formData.publishDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="mr-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700 text-sm font-medium">Featured on homepage</span>
              </label>
            </div>

            {formData.readingTime && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Estimated reading time:</span> {formData.readingTime} minute{formData.readingTime !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blocks' && (
          <div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-gray-900 font-medium mb-2">Content Blocks</h3>
              <p className="text-gray-700 text-sm">Build your content using modular blocks. Drag and drop to reorder.</p>
            </div>
            
            <BlockBuilder
              contentId={formData.id}
              initialBlocks={(formData.contentBlocks || []).map(block => ({
                ...block,
                contentId: formData.id,
                createdAt: new Date(),
                updatedAt: new Date(),
                blockType: block.blockType as BlockType,
                data: block.data as unknown as BlockData
              }))}
              onBlocksChange={handleContentBlocksChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
