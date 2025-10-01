'use client';

import { useState } from 'react';
import FormInput from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';
import FormSelect from '../forms/FormSelect';
import FormButton from '../forms/FormButton';
import TagInput from '../forms/TagInput';
import ImagePicker from '../media/ImagePicker';

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    description?: string | null;
    contentType: string;
    status?: string;
    featured: boolean;
    publishedDate: string;
    createdAt: string;
  };
  isEditing: boolean;
  editForm: {
    title: string;
    description?: string | null;
    featured: boolean;
    status: string;
    contentType: string;
    category?: string | null;
    author: string;
    imageUrl?: string | null;
    contentUrl?: string | null;
    tags: string[];
  };
  onEditFormChange: (field: string, value: string | boolean | string[]) => void;
  onStartEditing: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleFeatured: () => void;
  onOpenBlocks: () => void;
  onRemove: () => void;
  isUpdating: boolean;
  searchQuery?: string;
  className?: string;
}

export default function ContentCard({
  content,
  isEditing,
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
  className = ''
}: ContentCardProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'details'>('basic');

  const contentTypeLabels = {
    blog: 'Blog',
    project: 'Project',
    case_study: 'Case Study',
    tutorial: 'Tutorial',
    news: 'News'
  };

  const statusLabels = {
    PUBLISHED: 'Published',
    DRAFT: 'Draft',
    ARCHIVED: 'Archived'
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-gray-200 px-1 rounded">$1</mark>');
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'basic' && (
              <>
                <FormInput
                  label="Title"
                  value={editForm.title}
                  onChange={(e) => onEditFormChange('title', e.target.value)}
                  placeholder="Enter title"
                  inputSize="md"
                />

                <FormTextarea
                  label="Description (Optional)"
                  value={editForm.description || ''}
                  onChange={(e) => onEditFormChange('description', e.target.value)}
                  placeholder="Enter description (optional)"
                  size="md"
                />

                <FormSelect
                  label="Status"
                  options={[
                    { value: 'DRAFT', label: 'Draft' },
                    { value: 'PUBLISHED', label: 'Published' },
                    { value: 'ARCHIVED', label: 'Archived' }
                  ]}
                  value={editForm.status}
                  onChange={(e) => onEditFormChange('status', e.target.value)}
                  selectSize="md"
                />

                <div className="flex items-center gap-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={editForm.featured}
                      onChange={(e) => onEditFormChange('featured', e.target.checked)}
                      className="mr-2 w-4 h-4 text-gray-800 bg-gray-100 border-gray-300 rounded focus:ring-gray-800 focus:ring-2"
                    />
                    Featured
                  </label>
                </div>
              </>
            )}

            {activeTab === 'details' && (
              <>
                <FormSelect
                  label="Content Type"
                  options={[
                    { value: 'blog', label: 'Blog' },
                    { value: 'project', label: 'Project' },
                    { value: 'case_study', label: 'Case Study' }
                  ]}
                  value={editForm.contentType}
                  onChange={(e) => onEditFormChange('contentType', e.target.value)}
                  selectSize="md"
                />

                <FormInput
                  label="Category (Optional)"
                  value={editForm.category || ''}
                  onChange={(e) => onEditFormChange('category', e.target.value)}
                  placeholder="Enter category"
                  inputSize="md"
                />

                <FormInput
                  label="Author"
                  value={editForm.author}
                  onChange={(e) => onEditFormChange('author', e.target.value)}
                  placeholder="Enter author name"
                  inputSize="md"
                />

                <ImagePicker
                  label="Featured Image"
                  value={editForm.imageUrl || ''}
                  onChange={(media) => onEditFormChange('imageUrl', media?.blobUrl || '')}
                  onUrlChange={(url) => onEditFormChange('imageUrl', url)}
                  source="content"
                  contentId={content.id}
                  folder="content"
                  placeholder="No featured image selected"
                />

                <FormInput
                  label="Content URL (Optional)"
                  value={editForm.contentUrl || ''}
                  onChange={(e) => onEditFormChange('contentUrl', e.target.value)}
                  placeholder="Enter content URL"
                  inputSize="md"
                />

                <TagInput
                  label="Tags"
                  value={editForm.tags}
                  onChange={(tags) => onEditFormChange('tags', tags)}
                  placeholder="Enter tags separated by commas"
                  maxTags={10}
                />
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <FormButton
              variant="primary"
              size="sm"
              onClick={onSaveEdit}
              loading={isUpdating}
              disabled={isUpdating}
            >
              Save Changes
            </FormButton>
            <FormButton
              variant="secondary"
              size="sm"
              onClick={onCancelEdit}
            >
              Cancel
            </FormButton>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-3">
          <h3 className="text-gray-900 font-bold text-lg truncate group-hover:text-gray-700 transition-colors duration-200 mb-2">
            {searchQuery ? (
              <span dangerouslySetInnerHTML={{
                __html: highlightSearchText(content.title, searchQuery)
              }} />
            ) : (
              content.title
            )}
          </h3>
          
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
            {content.featured && (
              <span className="font-semibold underline">Featured</span>
            )}
            <span className="font-medium">
              {statusLabels[content.status as keyof typeof statusLabels] || content.status}
            </span>
            <span className="font-medium">
              {contentTypeLabels[content.contentType as keyof typeof contentTypeLabels] || content.contentType}
            </span>
            <span className="text-gray-500">
              {new Date(content.publishedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {content.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {searchQuery ? (
              <span dangerouslySetInnerHTML={{
                __html: highlightSearchText(content.description, searchQuery)
              }} />
            ) : (
              content.description
            )}
          </p>
        )}
        
        <div className="flex justify-start">
          <div className="flex gap-2">
            <FormButton
              variant="primary"
              size="sm"
              onClick={onStartEditing}
            >
              Edit
            </FormButton>
            <FormButton
              variant="secondary"
              size="sm"
              onClick={onOpenBlocks}
            >
              Blocks
            </FormButton>
            <FormButton
              variant={content.featured ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleFeatured}
              disabled={isUpdating}
            >
              {content.featured ? 'Unfeature' : 'Feature'}
            </FormButton>
            <FormButton
              variant="outline"
              size="sm"
              onClick={onRemove}
              disabled={isUpdating}
            >
              Remove
            </FormButton>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={`group bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 ${className}`}>
      {renderContent()}
    </div>
  );
}
