"use client";

import { useState, useEffect } from "react";

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  contentType: 'project' | 'case_study' | 'blog';
  category?: string | null;
  imageUrl?: string | null;
  publishedDate: string;
  author: string;
  tags: string[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content?type=project');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data.content || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    window.location.href = `/content/${projectId}`;
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[60vh]">
        <div className="michroma text-white/60 text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 pt-12">

        {/* Projects List */}
        {projects.length > 0 ? (
          <div className="space-y-8">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 p-6 text-center"
                role="article"
                aria-label={`Project: ${project.title}`}
                tabIndex={0}
                onClick={() => handleProjectClick(project.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProjectClick(project.id);
                  }
                }}
              >
                {/* Project Content */}
                <div className="space-y-6">
                  <h2 className="michroma text-3xl md:text-4xl lg:text-5xl font-semibold text-white transition-all duration-300 ease-out group-hover:underline decoration-2 underline-offset-4">
                    {project.title}
                  </h2>

                  <p className="michroma text-base md:text-lg lg:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto">
                    {project.description.length > 150
                      ? project.description.substring(0, 150).substring(0, project.description.substring(0, 150).lastIndexOf(' ')) + '...'
                      : project.description
                    }
                  </p>

                  <div className="michroma text-sm md:text-base text-white/60 flex flex-wrap items-center justify-center gap-2">
                    <span className="font-medium">Project</span>
                    <span aria-hidden="true" className="text-white/40">•</span>
                    <time
                      dateTime={project.publishedDate}
                      className="font-medium"
                    >
                      {new Date(project.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {project.category && (
                      <>
                        <span aria-hidden="true" className="text-white/40">•</span>
                        <span className="font-medium">{project.category}</span>
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
              No projects available yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}