"use client";

import { useState, useEffect } from "react";

interface NoteItem {
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

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content?type=blog');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotes(data.content || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteClick = (noteId: string) => {
    window.location.href = `/content/${noteId}`;
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[60vh]">
        <div className="michroma text-white/60 text-lg">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full pb-24">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-[45vw] mx-auto px-4 md:px-0 pt-12">

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="space-y-16">
            {notes.map((note) => (
              <article
                key={note.id}
                className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg transition-all duration-300 text-left"
                role="article"
                aria-label={`Note: ${note.title}`}
                tabIndex={0}
                onClick={() => handleNoteClick(note.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNoteClick(note.id);
                  }
                }}
              >
                {/* Note Content */}
                <div className="space-y-4">
                  <h2 className="michroma text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white transition-all duration-300 ease-out group-hover:underline decoration-2 underline-offset-4">
                    {note.title}
                  </h2>

                  <p className="michroma text-sm md:text-base lg:text-lg text-white/90 leading-relaxed">
                    {note.description && note.description.length > 150
                      ? note.description.substring(0, 150).substring(0, note.description.substring(0, 150).lastIndexOf(' ')) + '...'
                      : note.description || ''
                    }
                  </p>

                  <div className="michroma text-xs md:text-sm text-white/70 flex flex-wrap items-center gap-2">
                    <span className="font-medium">Note</span>
                    <span aria-hidden="true" className="text-white/40">•</span>
                    <time
                      dateTime={note.publishedDate}
                      className="font-medium"
                    >
                      {new Date(note.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {note.category && (
                      <>
                        <span aria-hidden="true" className="text-white/40">•</span>
                        <span className="font-medium">{note.category}</span>
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
              No notes available yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}