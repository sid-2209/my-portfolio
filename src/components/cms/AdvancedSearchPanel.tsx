"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Clock,
  Bookmark,
  BookmarkPlus,
  Zap,
  FileText,
  Image,
  Code,
  Quote,
  List,
  Calendar,
  User,
  Tag,
  Folder,
  Settings,
  RotateCcw
} from "lucide-react";
import { AdvancedSearchService, SearchFilters } from "../../services/searchService";

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

interface AdvancedSearchPanelProps {
  content: unknown[];
  onSearchResults: (results: unknown[], searchTime: number) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
  className?: string;
}

export default function AdvancedSearchPanel({
  content,
  onSearchResults,
  isVisible,
  onToggleVisibility,
  className = ""
}: AdvancedSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [resultCount, setResultCount] = useState<number>(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get filter options from content
  const filterOptions = useMemo(() => {
    return AdvancedSearchService.getFilterOptions(content);
  }, [content]);

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        setSavedSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, []);

  // Auto-suggestions
  useEffect(() => {
    if (query.length >= 2) {
      const suggestions = AdvancedSearchService.getSearchSuggestions(content, query, 5);
      setSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, content]);

  // Perform search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchFilters = { ...filters, query };
      const results = AdvancedSearchService.search(content, searchFilters, {
        sortBy: 'relevance',
        fuzzySearch: true
      });

      onSearchResults(results.results.map(r => r.item), results.searchTime);
      setSearchTime(results.searchTime);
      setResultCount(results.totalCount);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, filters, content, onSearchResults]);

  const handleFilterChange = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setQuery("");
    setFilters({});
  };

  const saveCurrentSearch = () => {
    const name = prompt("Enter a name for this search:");
    if (name) {
      const newSearch: SavedSearch = {
        id: Date.now().toString(),
        name,
        filters: { ...filters, query },
        createdAt: new Date()
      };

      const updatedSavedSearches = [...savedSearches, newSearch];
      setSavedSearches(updatedSavedSearches);
      localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches));
    }
  };

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setQuery(savedSearch.filters.query || "");
    setFilters(savedSearch.filters);
    setShowSavedSearches(false);
  };

  const deleteSavedSearch = (id: string) => {
    const updatedSavedSearches = savedSearches.filter(s => s.id !== id);
    setSavedSearches(updatedSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(updatedSavedSearches));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const activeFiltersCount = Object.values(filters).filter(value =>
    value !== undefined && value !== null && value !== "" &&
    !(Array.isArray(value) && value.length === 0)
  ).length + (query ? 1 : 0);

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed top-32 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg shadow-lg transition-colors"
        title="Advanced Search"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col ${className}`} style={{ width: '420px' }}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Search className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Advanced Search</h3>
            <p className="text-xs text-gray-500">
              {resultCount} results in {searchTime.toFixed(1)}ms
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={onToggleVisibility}
            className="p-2 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded transition-colors"
            title="Close Advanced Search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Auto-suggestions */}
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Bookmark className="w-3 h-3" />
            Saved ({savedSearches.length})
          </button>

          <button
            onClick={saveCurrentSearch}
            disabled={!query && activeFiltersCount === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <BookmarkPlus className="w-3 h-3" />
            Save
          </button>

          <button
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>

        {/* Saved Searches Dropdown */}
        {showSavedSearches && savedSearches.length > 0 && (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
            <div className="space-y-2">
              {savedSearches.map((savedSearch) => (
                <div key={savedSearch.id} className="flex items-center justify-between">
                  <button
                    onClick={() => loadSavedSearch(savedSearch)}
                    className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
                  >
                    {savedSearch.name}
                  </button>
                  <button
                    onClick={() => deleteSavedSearch(savedSearch.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Filters */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {/* Basic Filters */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Quick Filters
            </h4>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                value={filters.contentType || ""}
                onChange={(e) => handleFilterChange('contentType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                {filterOptions.contentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Featured */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured
              </label>
              <select
                value={filters.featured === true ? "true" : filters.featured === false ? "false" : ""}
                onChange={(e) => handleFilterChange('featured', e.target.value === "" ? null : e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="">All Content</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured Only</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Advanced Filters
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="space-y-3 border-t border-gray-200 pt-4">
              {/* Category */}
              {filterOptions.categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Folder className="w-3 h-3 inline mr-1" />
                    Category
                  </label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="w-3 h-3 inline mr-1" />
                  Author
                </label>
                <select
                  value={filters.author || ""}
                  onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">All Authors</option>
                  {filterOptions.authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Block Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Content Contains
                </label>
                <div className="space-y-2">
                  {[
                    { type: 'IMAGE', label: 'Images', icon: Image },
                    { type: 'CODE_BLOCK', label: 'Code', icon: Code },
                    { type: 'QUOTE', label: 'Quotes', icon: Quote },
                    { type: 'LIST', label: 'Lists', icon: List }
                  ].map(({ type, label, icon: Icon }) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.blockTypes?.includes(type) || false}
                        onChange={(e) => {
                          const currentTypes = filters.blockTypes || [];
                          if (e.target.checked) {
                            handleFilterChange('blockTypes', [...currentTypes, type]);
                          } else {
                            handleFilterChange('blockTypes', currentTypes.filter(t => t !== type));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <Icon className="w-3 h-3 text-gray-500" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Media Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Image className="w-3 h-3 inline mr-1" />
                  Media Content
                </label>
                <select
                  value={filters.hasMedia === true ? "true" : filters.hasMedia === false ? "false" : ""}
                  onChange={(e) => handleFilterChange('hasMedia', e.target.value === "" ? undefined : e.target.value === "true")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">Any</option>
                  <option value="true">Has Images</option>
                  <option value="false">No Images</option>
                </select>
              </div>

              {/* Word Count Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word Count Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.wordCount?.min || ""}
                    onChange={(e) => handleFilterChange('wordCount', {
                      ...filters.wordCount,
                      min: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.wordCount?.max || ""}
                    onChange={(e) => handleFilterChange('wordCount', {
                      ...filters.wordCount,
                      max: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Smart search enabled</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Real-time results</span>
          </div>
        </div>
      </div>
    </div>
  );
}