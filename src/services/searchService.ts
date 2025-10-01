export interface SearchFilters {
  query?: string;
  contentType?: string;
  status?: string;
  featured?: boolean | null;
  dateRange?: string;
  category?: string;
  tags?: string[];
  author?: string;
  blockTypes?: string[];
  hasMedia?: boolean;
  wordCount?: { min?: number; max?: number };
  readingTime?: { min?: number; max?: number };
  createdDateRange?: { start?: Date; end?: Date };
  updatedDateRange?: { start?: Date; end?: Date };
}

export interface SearchOptions {
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'title' | 'title-desc' | 'status' | 'type' | 'author';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  fuzzySearch?: boolean;
  highlightMatches?: boolean;
}

export interface SearchResult {
  item: unknown;
  score: number;
  highlights?: {
    field: string;
    matches: string[];
  }[];
}

export interface ContentSearchIndex {
  id: string;
  title: string;
  description?: string | null;
  contentType: string;
  status?: string;
  featured: boolean;
  category?: string | null;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  publishedDate: Date;
  // Content blocks text for full-text search
  blockTexts: string[];
  blockTypes: string[];
  // Computed fields
  wordCount: number;
  readingTime: number;
  hasImages: boolean;
  hasCode: boolean;
  hasQuotes: boolean;
  hasLists: boolean;
}

export class AdvancedSearchService {
  private static calculateReadingTime(text: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private static extractBlockTexts(contentBlocks: unknown[]): { texts: string[]; types: string[]; hasImages: boolean; hasCode: boolean; hasQuotes: boolean; hasLists: boolean; } {
    const texts: string[] = [];
    const types: string[] = [];
    let hasImages = false;
    let hasCode = false;
    let hasQuotes = false;
    let hasLists = false;

    contentBlocks.forEach(block => {
      types.push(block.blockType);

      if (block.data && typeof block.data === 'object') {
        const blockData = block.data as Record<string, unknown>;

        switch (block.blockType) {
          case 'PARAGRAPH':
          case 'HEADING':
            if (blockData.text && typeof blockData.text === 'string') {
              texts.push(this.stripHtml(blockData.text));
            }
            break;

          case 'IMAGE':
            hasImages = true;
            if (blockData.alt && typeof blockData.alt === 'string') {
              texts.push(blockData.alt);
            }
            if (blockData.caption && typeof blockData.caption === 'string') {
              texts.push(blockData.caption);
            }
            break;

          case 'CODE_BLOCK':
            hasCode = true;
            if (blockData.code && typeof blockData.code === 'string') {
              texts.push(blockData.code);
            }
            break;

          case 'QUOTE':
            hasQuotes = true;
            if (blockData.text && typeof blockData.text === 'string') {
              texts.push(blockData.text);
            }
            if (blockData.author && typeof blockData.author === 'string') {
              texts.push(blockData.author);
            }
            break;

          case 'LIST':
            hasLists = true;
            if (Array.isArray(blockData.items)) {
              blockData.items.forEach(item => {
                if (typeof item === 'string') {
                  texts.push(item);
                }
              });
            }
            break;

          case 'CUSTOM':
            if (blockData.html && typeof blockData.html === 'string') {
              texts.push(this.stripHtml(blockData.html));
            }
            break;
        }
      }
    });

    return { texts, types, hasImages, hasCode, hasQuotes, hasLists };
  }

  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  private static createSearchIndex(content: unknown[]): ContentSearchIndex[] {
    return content.map(item => {
      const blockInfo = this.extractBlockTexts(item.contentBlocks || []);
      const allText = [
        item.title || '',
        item.description || '',
        ...blockInfo.texts
      ].join(' ');

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        contentType: item.contentType,
        status: item.status,
        featured: item.featured,
        category: item.category,
        tags: item.tags || [],
        author: item.author,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        publishedDate: new Date(item.publishedDate),
        blockTexts: blockInfo.texts,
        blockTypes: blockInfo.types,
        wordCount: allText.split(/\s+/).length,
        readingTime: this.calculateReadingTime(allText),
        hasImages: blockInfo.hasImages,
        hasCode: blockInfo.hasCode,
        hasQuotes: blockInfo.hasQuotes,
        hasLists: blockInfo.hasLists
      };
    });
  }

  private static calculateRelevanceScore(
    index: ContentSearchIndex,
    query: string,
    fuzzySearch: boolean = false
  ): number {
    if (!query) return 1;

    const queryTerms = query.toLowerCase().split(/\s+/);
    let score = 0;

    // Title matching (highest weight)
    queryTerms.forEach(term => {
      if (index.title.toLowerCase().includes(term)) {
        score += fuzzySearch ? this.fuzzyMatch(index.title.toLowerCase(), term) * 10 : 10;
      }
    });

    // Description matching (medium weight)
    if (index.description) {
      queryTerms.forEach(term => {
        if (index.description!.toLowerCase().includes(term)) {
          score += fuzzySearch ? this.fuzzyMatch(index.description!.toLowerCase(), term) * 5 : 5;
        }
      });
    }

    // Tags matching (high weight)
    index.tags.forEach(tag => {
      queryTerms.forEach(term => {
        if (tag.toLowerCase().includes(term)) {
          score += fuzzySearch ? this.fuzzyMatch(tag.toLowerCase(), term) * 8 : 8;
        }
      });
    });

    // Content blocks matching (lower weight)
    index.blockTexts.forEach(text => {
      queryTerms.forEach(term => {
        if (text.toLowerCase().includes(term)) {
          score += fuzzySearch ? this.fuzzyMatch(text.toLowerCase(), term) * 2 : 2;
        }
      });
    });

    // Category matching (medium weight)
    if (index.category) {
      queryTerms.forEach(term => {
        if (index.category!.toLowerCase().includes(term)) {
          score += fuzzySearch ? this.fuzzyMatch(index.category!.toLowerCase(), term) * 6 : 6;
        }
      });
    }

    // Author matching (medium weight)
    queryTerms.forEach(term => {
      if (index.author.toLowerCase().includes(term)) {
        score += fuzzySearch ? this.fuzzyMatch(index.author.toLowerCase(), term) * 6 : 6;
      }
    });

    return score;
  }

  private static fuzzyMatch(text: string, term: string): number {
    const distance = this.levenshteinDistance(text, term);
    const maxLength = Math.max(text.length, term.length);
    return Math.max(0, (maxLength - distance) / maxLength);
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private static applyFilters(
    index: ContentSearchIndex[],
    filters: SearchFilters
  ): ContentSearchIndex[] {
    return index.filter(item => {
      // Content type filter
      if (filters.contentType && item.contentType !== filters.contentType) {
        return false;
      }

      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Featured filter
      if (filters.featured !== null && filters.featured !== undefined && item.featured !== filters.featured) {
        return false;
      }

      // Category filter
      if (filters.category && item.category !== filters.category) {
        return false;
      }

      // Tags filter (must include all specified tags)
      if (filters.tags && filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag =>
          item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasAllTags) return false;
      }

      // Author filter
      if (filters.author && !item.author.toLowerCase().includes(filters.author.toLowerCase())) {
        return false;
      }

      // Block types filter
      if (filters.blockTypes && filters.blockTypes.length > 0) {
        const hasRequiredBlockTypes = filters.blockTypes.every(type =>
          item.blockTypes.includes(type)
        );
        if (!hasRequiredBlockTypes) return false;
      }

      // Media filter
      if (filters.hasMedia === true && !item.hasImages) {
        return false;
      }
      if (filters.hasMedia === false && item.hasImages) {
        return false;
      }

      // Word count filter
      if (filters.wordCount) {
        if (filters.wordCount.min && item.wordCount < filters.wordCount.min) {
          return false;
        }
        if (filters.wordCount.max && item.wordCount > filters.wordCount.max) {
          return false;
        }
      }

      // Reading time filter
      if (filters.readingTime) {
        if (filters.readingTime.min && item.readingTime < filters.readingTime.min) {
          return false;
        }
        if (filters.readingTime.max && item.readingTime > filters.readingTime.max) {
          return false;
        }
      }

      // Date range filters
      if (filters.createdDateRange) {
        if (filters.createdDateRange.start && item.createdAt < filters.createdDateRange.start) {
          return false;
        }
        if (filters.createdDateRange.end && item.createdAt > filters.createdDateRange.end) {
          return false;
        }
      }

      if (filters.updatedDateRange) {
        if (filters.updatedDateRange.start && item.updatedAt < filters.updatedDateRange.start) {
          return false;
        }
        if (filters.updatedDateRange.end && item.updatedAt > filters.updatedDateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  private static sortResults(
    results: SearchResult[],
    sortBy: string = 'relevance',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): SearchResult[] {
    return results.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'newest':
          comparison = new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime();
          break;
        case 'oldest':
          comparison = new Date(a.item.createdAt).getTime() - new Date(b.item.createdAt).getTime();
          break;
        case 'title':
          comparison = a.item.title.localeCompare(b.item.title);
          break;
        case 'title-desc':
          comparison = b.item.title.localeCompare(a.item.title);
          break;
        case 'status':
          comparison = (a.item.status || '').localeCompare(b.item.status || '');
          break;
        case 'type':
          comparison = a.item.contentType.localeCompare(b.item.contentType);
          break;
        case 'author':
          comparison = a.item.author.localeCompare(b.item.author);
          break;
        default:
          comparison = b.score - a.score;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  static search(
    content: unknown[],
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): {
    results: SearchResult[];
    totalCount: number;
    searchTime: number;
  } {
    const startTime = performance.now();

    // Create search index
    const searchIndex = this.createSearchIndex(content);

    // Apply filters first
    const filteredIndex = this.applyFilters(searchIndex, filters);

    // Calculate relevance scores and create results
    let results: SearchResult[] = filteredIndex.map(item => ({
      item: content.find(c => c.id === item.id),
      score: this.calculateRelevanceScore(item, filters.query || '', options.fuzzySearch)
    }));

    // Sort results
    results = this.sortResults(
      results,
      options.sortBy || 'relevance',
      options.sortOrder || 'desc'
    );

    // Apply pagination
    const totalCount = results.length;
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      results = results.slice(start, end);
    }

    const searchTime = performance.now() - startTime;

    return {
      results,
      totalCount,
      searchTime
    };
  }

  static getSearchSuggestions(content: unknown[], partialQuery: string, limit: number = 5): string[] {
    if (partialQuery.length < 2) return [];

    const suggestions = new Set<string>();
    const searchIndex = this.createSearchIndex(content);
    const query = partialQuery.toLowerCase();

    searchIndex.forEach(item => {
      // Title suggestions
      if (item.title.toLowerCase().includes(query)) {
        suggestions.add(item.title);
      }

      // Tag suggestions
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestions.add(tag);
        }
      });

      // Category suggestions
      if (item.category && item.category.toLowerCase().includes(query)) {
        suggestions.add(item.category);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  static getFilterOptions(content: unknown[]): {
    contentTypes: string[];
    statuses: string[];
    categories: string[];
    tags: string[];
    authors: string[];
    blockTypes: string[];
  } {
    const searchIndex = this.createSearchIndex(content);

    return {
      contentTypes: [...new Set(searchIndex.map(item => item.contentType))],
      statuses: [...new Set(searchIndex.map(item => item.status).filter(Boolean))],
      categories: [...new Set(searchIndex.map(item => item.category).filter(Boolean))],
      tags: [...new Set(searchIndex.flatMap(item => item.tags))],
      authors: [...new Set(searchIndex.map(item => item.author))],
      blockTypes: [...new Set(searchIndex.flatMap(item => item.blockTypes))]
    };
  }
}