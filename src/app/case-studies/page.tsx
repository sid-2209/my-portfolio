"use client";

import { useState, useEffect } from "react";

interface CaseStudyItem {
  id: string;
  title: string;
  description?: string | null;
  contentType: 'project' | 'case_study' | 'blog';
  category?: string | null;
  imageUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCaseStudies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content?type=case_study');
      if (!response.ok) {
        throw new Error('Failed to fetch case studies');
      }
      const data = await response.json();
      setCaseStudies(data.content || []);
    } catch (error) {
      console.error('Error fetching case studies:', error);
      setCaseStudies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaseStudyClick = (caseStudyId: string) => {
    window.location.href = `/content/${caseStudyId}`;
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[60vh]">
        <div className="michroma text-white/60 text-lg">Loading case studies...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full pb-24">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 pt-12">

        {/* Case Studies List */}
        {caseStudies.length > 0 ? (
          <div className="space-y-8">
            {caseStudies.map((caseStudy) => (
              <article
                key={caseStudy.id}
                className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 p-6 text-center"
                role="article"
                aria-label={`Case Study: ${caseStudy.title}`}
                tabIndex={0}
                onClick={() => handleCaseStudyClick(caseStudy.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCaseStudyClick(caseStudy.id);
                  }
                }}
              >
                {/* Case Study Content */}
                <div className="space-y-6">
                  <h2 className="michroma text-3xl md:text-4xl lg:text-5xl font-semibold text-white transition-all duration-300 ease-out group-hover:underline decoration-2 underline-offset-4">
                    {caseStudy.title}
                  </h2>

                  <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
                    {caseStudy.description && caseStudy.description.length > 150
                      ? caseStudy.description.substring(0, 150).substring(0, caseStudy.description.substring(0, 150).lastIndexOf(' ')) + '...'
                      : caseStudy.description || ''
                    }
                  </p>

                  <div className="michroma text-sm md:text-base text-white/60 flex flex-wrap items-center justify-center gap-2">
                    <span className="font-medium">Case Study</span>
                    <span aria-hidden="true" className="text-white/40">•</span>
                    <time
                      dateTime={caseStudy.publishedDate}
                      className="font-medium"
                    >
                      {new Date(caseStudy.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {caseStudy.category && (
                      <>
                        <span aria-hidden="true" className="text-white/40">•</span>
                        <span className="font-medium">{caseStudy.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="michroma text-white/60 text-lg text-center">
              No case studies available yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}