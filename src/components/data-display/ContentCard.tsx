'use client';

import FormInput from '../forms/FormInput';
import FormTextarea from '../forms/FormTextarea';
import FormSelect from '../forms/FormSelect';
import FormButton from '../forms/FormButton';

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    description: string;
    contentType: string;
    status?: string;
    featured: boolean;
    publishedDate: string;
    createdAt: string;
  };
  isEditing: boolean;
  editForm: {
    title: string;
    description: string;
    featured: boolean;
    status: string;
  };
  onEditFormChange: (field: string, value: string | boolean) => void;
  onStartEditing: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleFeatured: () => void;
  onOpenBlocks: () => void;
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
  isUpdating,
  searchQuery,
  className = ''
}: ContentCardProps) {
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
          <FormInput
            label="Title"
            value={editForm.title}
            onChange={(e) => onEditFormChange('title', e.target.value)}
            placeholder="Enter title"
            inputSize="md"
          />
          
          <FormTextarea
            label="Description"
            value={editForm.description}
            onChange={(e) => onEditFormChange('description', e.target.value)}
            placeholder="Enter description"
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
          
          <div className="flex gap-2">
            <FormButton
              variant="primary"
              size="sm"
              onClick={onSaveEdit}
              loading={isUpdating}
              disabled={isUpdating}
            >
              Save
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
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {searchQuery ? (
            <span dangerouslySetInnerHTML={{
              __html: highlightSearchText(content.description, searchQuery)
            }} />
          ) : (
            content.description
          )}
        </p>
        
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
              {content.featured ? 'Remove' : 'Feature'}
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
