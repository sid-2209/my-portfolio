"use client";

import { useState, useEffect, useCallback } from "react";
import FeaturedCarousel from "../components/ui/FeaturedCarousel";
import MinimalistDivider from "../components/ui/MinimalistDivider";
import ContentSection from "../components/ui/ContentSection";

interface ContentItem {
  id: string;
  title: string;
  description?: string | null;
  contentType: 'project' | 'case_study' | 'blog';
  category?: string | null;
  imageUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
  contentBlocks?: { id: string; blockType: string; data: unknown; order: number }[];
}

export default function Home() {
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [projectsContent, setProjectsContent] = useState<ContentItem[]>([]);
  const [caseStudiesContent, setCaseStudiesContent] = useState<ContentItem[]>([]);
  const [notesContent, setNotesContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState({
    projects: true,
    caseStudies: true,
    notes: true
  });

  const fetchSectionContent = useCallback(async (featuredIds: string[]) => {
    const sections = [
      { type: 'project', setter: setProjectsContent, key: 'projects' },
      { type: 'case_study', setter: setCaseStudiesContent, key: 'caseStudies' },
      { type: 'blog', setter: setNotesContent, key: 'notes' }
    ];

    const fetchPromises = sections.map(async (section) => {
      try {
        const params = new URLSearchParams({
          type: section.type,
          limit: '3'
        });

        if (featuredIds.length > 0) {
          params.append('exclude', featuredIds.join(','));
        }

        const response = await fetch(`/api/content?${params}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${section.type} content`);
        }
        const data = await response.json();
        section.setter(data.content || []);
      } catch (error) {
        console.error(`Error fetching ${section.type} content:`, error);
        section.setter([]);
      } finally {
        setSectionsLoading(prev => ({
          ...prev,
          [section.key]: false
        }));
      }
    });

    await Promise.all(fetchPromises);
  }, []);

  const fetchFeaturedContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content/featured?page=1&limit=5', {
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch featured content');
      }
      const data = await response.json();
      const featured = data.content || [];
      setFeaturedContent(featured);

      // After featured content is loaded, fetch section content
      // Exclude all featured content IDs from section content
      const featuredIds = featured.map((item: ContentItem) => item.id);
      await fetchSectionContent(featuredIds);
    } catch (error) {
      console.error('Error fetching featured content:', error);
      setFeaturedContent([]);
      // Still try to fetch section content even if featured fails
      await fetchSectionContent([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSectionContent]);

  const handleContentClick = (contentId: string) => {
    window.location.href = `/content/${contentId}`;
  };

  useEffect(() => {
    fetchFeaturedContent();
  }, [fetchFeaturedContent]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[60vh]">
        <div className="michroma text-white/60 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {featuredContent.length > 0 ? (
        <>
          <FeaturedCarousel
            content={featuredContent}
            onContentClick={handleContentClick}
          />
          <MinimalistDivider />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="michroma text-white/60 text-lg text-center">
            No featured content available
          </div>
        </div>
      )}

      {/* Projects Section */}
      <ContentSection
        title="Projects"
        linkHref="/projects"
        linkText="View All Projects"
        contentItems={projectsContent}
        onContentClick={handleContentClick}
        isLoading={sectionsLoading.projects}
      />
      <MinimalistDivider />

      {/* Case Studies Section */}
      <ContentSection
        title="Case Studies"
        linkHref="/case-studies"
        linkText="View All Case Studies"
        contentItems={caseStudiesContent}
        onContentClick={handleContentClick}
        isLoading={sectionsLoading.caseStudies}
      />
      <MinimalistDivider />

      {/* Notes Section */}
      <ContentSection
        title="Notes"
        linkHref="/notes"
        linkText="View All Notes"
        contentItems={notesContent}
        onContentClick={handleContentClick}
        isLoading={sectionsLoading.notes}
      />
    </div>
  );
}
