'use client';

import { useMemo } from 'react';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import FormButton from '../forms/FormButton';

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterContentType: string;
  onFilterContentTypeChange: (type: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterFeatured: string;
  onFilterFeaturedChange: (featured: string) => void;
  filterDateRange: string;
  onFilterDateRangeChange: (range: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onClearFilters: () => void;
  totalResults: number;
  className?: string;
}

export default function SearchAndFilterBar({
  searchQuery,
  onSearchChange,
  filterContentType,
  onFilterContentTypeChange,
  filterStatus,
  onFilterStatusChange,
  filterFeatured,
  onFilterFeaturedChange,
  filterDateRange,
  onFilterDateRangeChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  totalResults,
  className = ''
}: SearchAndFilterBarProps) {
  const contentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'blog', label: 'Blog' },
    { value: 'project', label: 'Project' },
    { value: 'case_study', label: 'Case Study' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'news', label: 'News' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const featuredOptions = [
    { value: '', label: 'All Content' },
    { value: 'featured', label: 'Featured Only' },
    { value: 'non-featured', label: 'Non-Featured Only' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'status', label: 'By Status' },
    { value: 'type', label: 'By Type' }
  ];

  const hasActiveFilters = useMemo(() => {
    return searchQuery || filterContentType || filterStatus || filterFeatured || filterDateRange || sortBy !== 'newest';
  }, [searchQuery, filterContentType, filterStatus, filterFeatured, filterDateRange, sortBy]);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8 ${className}`}>
      {/* Search Bar */}
      <div className="mb-6">
        <FormInput
          label="Search Content"
          placeholder="Search by title, description, or content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          inputSize="lg"
        />
      </div>

      {/* Filters Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <FormSelect
          label="Content Type"
          options={contentTypeOptions}
          value={filterContentType}
          onChange={(e) => onFilterContentTypeChange(e.target.value)}
          selectSize="md"
        />
        
        <FormSelect
          label="Status"
          options={statusOptions}
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          selectSize="md"
        />
        
        <FormSelect
          label="Featured"
          options={featuredOptions}
          value={filterFeatured}
          onChange={(e) => onFilterFeaturedChange(e.target.value)}
          selectSize="md"
        />
        
        <FormSelect
          label="Date Range"
          options={dateRangeOptions}
          value={filterDateRange}
          onChange={(e) => onFilterDateRangeChange(e.target.value)}
          selectSize="md"
        />
      </div>

      {/* Filters Row 2 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="flex-1">
          <FormSelect
            label="Sort By"
            options={sortOptions}
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            selectSize="md"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalResults}</span> results found
          </div>
          
          {hasActiveFilters && (
            <FormButton
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            >
              Clear Filters
            </FormButton>
          )}
        </div>
      </div>
    </div>
  );
}
