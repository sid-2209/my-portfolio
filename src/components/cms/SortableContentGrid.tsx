"use client";

import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentCard } from "../data-display";

interface Content {
  id: string;
  title: string;
  description?: string | null;
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

interface EditForm {
  title: string;
  description: string;
  featured: boolean;
  status: string;
  contentType: string;
  category: string;
  author: string;
  imageUrl: string;
  contentUrl: string;
  tags: string[];
}

interface SortableContentGridProps {
  content: Content[];
  onContentReorder: (reorderedContent: Content[]) => void;
  editingId: string | null;
  editForm: EditForm;
  onEditFormChange: (field: string, value: unknown) => void;
  onStartEditing: (item: Content) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleFeatured: (id: string, currentFeatured: boolean) => void;
  onOpenBlocks: (id: string) => void;
  onRemove: (item: Content) => void;
  isUpdating: boolean;
  searchQuery: string;
  sectionId?: 'featured' | 'all';
  hideInstructions?: boolean;
}

// Sortable Content Card Component
interface SortableContentCardProps {
  content: Content;
  isEditing: boolean;
  editForm: EditForm;
  onEditFormChange: (field: string, value: unknown) => void;
  onStartEditing: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleFeatured: () => void;
  onOpenBlocks: () => void;
  onRemove: () => void;
  isUpdating: boolean;
  searchQuery: string;
  isDragging?: boolean;
}

function SortableContentCard(props: SortableContentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: props.content.id,
    data: {
      content: props.content
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: props.isDragging || isSortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Drag to reorder"
      >
        <div className="w-8 h-8 bg-white hover:bg-gray-50 rounded-lg flex items-center justify-center border border-gray-300 shadow-sm">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      <ContentCard
        content={{
          id: props.content.id,
          title: props.content.title,
          description: props.content.description,
          contentType: props.content.contentType,
          status: props.content.status,
          featured: props.content.featured,
          publishedDate: props.content.publishedDate,
          createdAt: props.content.createdAt
        }}
        isEditing={props.isEditing}
        editForm={props.editForm}
        onEditFormChange={props.onEditFormChange}
        onStartEditing={props.onStartEditing}
        onSaveEdit={props.onSaveEdit}
        onCancelEdit={props.onCancelEdit}
        onToggleFeatured={props.onToggleFeatured}
        onOpenBlocks={props.onOpenBlocks}
        onRemove={props.onRemove}
        isUpdating={props.isUpdating}
        searchQuery={props.searchQuery}
      />
    </div>
  );
}

export default function SortableContentGrid({
  content,
  onContentReorder,
  editingId,
  editForm,
  onEditFormChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onToggleFeatured,
  onOpenBlocks,
  onRemove,
  isUpdating,
  searchQuery,
  sectionId,
  hideInstructions = false
}: SortableContentGridProps) {

  if (content.length === 0) {
    return (
      <div className="text-center py-16 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <p className="text-xl mb-2 font-medium">No content yet</p>
        <p className="text-gray-500">Create your first piece of content to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {!hideInstructions && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Drag & Drop Content Organization</p>
              <p>Hover over any content card and use the drag handle (≡) in the top-right corner to reorder your content. Drag between Featured and All Content sections to feature/unfeature posts. Changes are saved automatically.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sortable Content Grid */}
      <SortableContext items={content.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.map((item) => (
            <SortableContentCard
              key={item.id}
              content={item}
              isEditing={editingId === item.id}
              editForm={editForm}
              onEditFormChange={onEditFormChange}
              onStartEditing={() => onStartEditing(item)}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onToggleFeatured={() => onToggleFeatured(item.id, item.featured)}
              onOpenBlocks={() => onOpenBlocks(item.id)}
              onRemove={() => onRemove(item)}
              isUpdating={isUpdating}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}