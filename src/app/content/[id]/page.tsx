"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="pt-32 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-white/60">Loading post...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Navbar />
        <div className="pt-32 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-white/60">Post not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      
      <div className="pt-32 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                {content.contentType}
              </span>
              {content.category && (
                <span className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
                  {content.category}
                </span>
              )}
            </div>
            <h1 className="michroma text-white/90 text-4xl font-bold mb-4">
              {content.title}
            </h1>
            <p className="text-white/80 text-lg mb-6">
              {content.description}
            </p>
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <span>By {content.author}</span>
              <span>{new Date(content.publishedDate).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Featured Image */}
          {content.imageUrl && (
            <div className="mb-8">
              <img 
                src={content.imageUrl} 
                alt={content.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-white/80 leading-relaxed">
              <p className="text-lg mb-6">{content.description}</p>
              
              {content.contentUrl && (
                <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-white/90 text-xl font-bold mb-4">Read More</h3>
                  <a 
                    href={content.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View Full Article →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {content.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-white/90 text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full"
                  >
                    {tag}
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
