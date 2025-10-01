"use client";

import { useState, useCallback, useMemo } from 'react';
import { AdvancedSearchService, SearchFilters, SearchOptions } from '../services/searchService';

export interface UseAdvancedSearchOptions {
  defaultSortBy?: string;
  defaultFilters?: SearchFilters;
  autoSearch?: boolean;
  debounceMs?: number;
}

export function useAdvancedSearch(
  content: unknown[],
  options: UseAdvancedSearchOptions = {}
) {
  const {
    defaultSortBy = 'relevance',
    defaultFilters = {},
    autoSearch = true,
    debounceMs = 300
  } = options;

  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    sortBy: defaultSortBy as 'relevance' | 'newest' | 'oldest' | 'title' | 'title-desc' | 'status' | 'type' | 'author',
    fuzzySearch: true,
    highlightMatches: true
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<unknown[]>([]);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);

  // Debounced search execution
  const executeSearch = useCallback(async () => {
    if (!content.length) {
      setSearchResults([]);
      setTotalResults(0);
      setSearchTime(0);
      return;
    }

    setIsSearching(true);

    try {
      const result = AdvancedSearchService.search(content, filters, searchOptions);

      setSearchResults(result.results.map(r => r.item));
      setTotalResults(result.totalCount);
      setSearchTime(result.searchTime);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
      setSearchTime(0);
    } finally {
      setIsSearching(false);
    }
  }, [content, filters, searchOptions]);

  // Auto-search when dependencies change
  useMemo(() => {
    if (autoSearch) {
      const debounceTimer = setTimeout(executeSearch, debounceMs);
      return () => clearTimeout(debounceTimer);
    }
  }, [executeSearch, autoSearch, debounceMs]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update search options
  const updateSearchOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setSearchOptions(prev => ({ ...prev, ...newOptions }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  // Clear specific filter
  const clearFilter = useCallback((key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Get search suggestions
  const getSearchSuggestions = useCallback((query: string, limit?: number) => {
    return AdvancedSearchService.getSearchSuggestions(content, query, limit);
  }, [content]);

  // Get available filter options
  const filterOptions = useMemo(() => {
    return AdvancedSearchService.getFilterOptions(content);
  }, [content]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value =>
      value !== undefined && value !== null && value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    );
  }, [filters]);

  // Get filter summary for display
  const getFilterSummary = useCallback(() => {
    const activeFilters: string[] = [];

    if (filters.query) activeFilters.push(`Query: "${filters.query}"`);
    if (filters.contentType) activeFilters.push(`Type: ${filters.contentType}`);
    if (filters.status) activeFilters.push(`Status: ${filters.status}`);
    if (filters.featured !== null && filters.featured !== undefined) {
      activeFilters.push(`Featured: ${filters.featured ? 'Yes' : 'No'}`);
    }
    if (filters.category) activeFilters.push(`Category: ${filters.category}`);
    if (filters.author) activeFilters.push(`Author: ${filters.author}`);
    if (filters.tags && filters.tags.length > 0) {
      activeFilters.push(`Tags: ${filters.tags.join(', ')}`);
    }
    if (filters.blockTypes && filters.blockTypes.length > 0) {
      activeFilters.push(`Content: ${filters.blockTypes.join(', ')}`);
    }
    if (filters.hasMedia !== null && filters.hasMedia !== undefined) {
      activeFilters.push(`Media: ${filters.hasMedia ? 'With Images' : 'No Images'}`);
    }
    if (filters.wordCount) {
      const { min, max } = filters.wordCount;
      if (min && max) activeFilters.push(`Words: ${min}-${max}`);
      else if (min) activeFilters.push(`Words: ${min}+`);
      else if (max) activeFilters.push(`Words: <${max}`);
    }
    if (filters.readingTime) {
      const { min, max } = filters.readingTime;
      if (min && max) activeFilters.push(`Reading Time: ${min}-${max}min`);
      else if (min) activeFilters.push(`Reading Time: ${min}min+`);
      else if (max) activeFilters.push(`Reading Time: <${max}min`);
    }

    return activeFilters;
  }, [filters]);

  // Manual search trigger
  const performSearch = useCallback(() => {
    return executeSearch();
  }, [executeSearch]);

  // Export search results to different formats
  const exportResults = useCallback((format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(searchResults, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `search-results-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Basic CSV export - can be enhanced based on needs
      const headers = ['ID', 'Title', 'Type', 'Status', 'Author', 'Created'];
      const rows = searchResults.map(item => [
        item.id,
        `"${item.title.replace(/"/g, '""')}"`,
        item.contentType,
        item.status || '',
        item.author,
        new Date(item.createdAt).toISOString().split('T')[0]
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `search-results-${Date.now()}.csv`;
      link.click();

      URL.revokeObjectURL(url);
    }
  }, [searchResults]);

  return {
    // Search state
    filters,
    searchOptions,
    searchResults,
    searchTime,
    totalResults,
    isSearching,
    hasActiveFilters,

    // Filter management
    updateFilters,
    clearFilters,
    clearFilter,
    filterOptions,

    // Search options
    updateSearchOptions,

    // Search actions
    performSearch,
    getSearchSuggestions,
    getFilterSummary,
    exportResults,

    // Utility functions
    executeSearch
  };
}