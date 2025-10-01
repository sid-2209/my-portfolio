"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Tag,
  Calendar,
  User,
  FileText,
  Bookmark,
  Star,
  BarChart3,
  Layout,
  Code
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  contentType: string;
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultAuthor?: string;
  defaultTags: string[];
  defaultCategory?: string;
  defaultFeatured: boolean;
  templateBlocks: TemplateBlock[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateBlock {
  id: string;
  blockType: string;
  order: number;
  data: unknown;
  isRequired: boolean;
}

interface Snippet {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags: string[];
  blockType: string;
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  data: unknown;
  createdAt: string;
  updatedAt: string;
}

interface TemplateManagerProps {
  onCreateContent?: (template: Template) => void;
  onInsertSnippet?: (snippet: Snippet) => void;
}

export default function TemplateManager({
  onCreateContent,
  onInsertSnippet
}: TemplateManagerProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'snippets'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchSnippets();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSnippets = async () => {
    try {
      const response = await fetch('/api/snippets');
      if (response.ok) {
        const data = await response.json();
        setSnippets(data);
      }
    } catch (error) {
      console.error('Error fetching snippets:', error);
    }
  };

  const applyTemplate = async (template: Template) => {
    try {
      const response = await fetch(`/api/templates/${template.id}/use`, {
        method: 'POST'
      });
      if (response.ok) {
        // Update usage count locally
        setTemplates(prev => prev.map(t =>
          t.id === template.id
            ? { ...t, usageCount: t.usageCount + 1 }
            : t
        ));

        if (onCreateContent) {
          onCreateContent(template);
        }
      }
    } catch (error) {
      console.error('Error using template:', error);
    }
  };

  const applySnippet = async (snippet: Snippet) => {
    try {
      const response = await fetch(`/api/snippets/${snippet.id}/use`, {
        method: 'POST'
      });
      if (response.ok) {
        // Update usage count locally
        setSnippets(prev => prev.map(s =>
          s.id === snippet.id
            ? { ...s, usageCount: s.usageCount + 1 }
            : s
        ));

        if (onInsertSnippet) {
          onInsertSnippet(snippet);
        }
      }
    } catch (error) {
      console.error('Error using snippet:', error);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const deleteSnippet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snippet?')) return;

    try {
      const response = await fetch(`/api/snippets/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSnippets(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = !searchQuery ||
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || snippet.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = activeTab === 'templates'
    ? [...new Set(templates.map(t => t.category).filter(Boolean))]
    : [...new Set(snippets.map(s => s.category).filter(Boolean))];

  const getBlockTypeIcon = (blockType: string) => {
    switch (blockType) {
      case 'PARAGRAPH': return <FileText className="w-4 h-4" />;
      case 'HEADING': return <Layout className="w-4 h-4" />;
      case 'IMAGE': return <Eye className="w-4 h-4" />;
      case 'CODE_BLOCK': return <Code className="w-4 h-4" />;
      case 'QUOTE': return <Bookmark className="w-4 h-4" />;
      case 'LIST': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Content Library</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'templates'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              activeTab === 'snippets'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Snippets ({snippets.length})
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'templates' ? (
          <div className="space-y-3">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Layout className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                <p>No templates found</p>
              </div>
            ) : (
              filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {template.name}
                        </h3>
                        {template.isPublic && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>

                      {template.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {template.contentType}
                          </span>
                          <span className="flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {template.usageCount} uses
                          </span>
                          <span className="flex items-center">
                            <Layout className="w-3 h-3 mr-1" />
                            {template.templateBlocks.length} blocks
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => applyTemplate(template)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Use Template
                          </button>
                          <button
                            onClick={() => setSelectedTemplate(template)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{template.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Code className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                <p>No snippets found</p>
              </div>
            ) : (
              filteredSnippets.map(snippet => (
                <div
                  key={snippet.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        {getBlockTypeIcon(snippet.blockType)}
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {snippet.name}
                        </h3>
                        {snippet.isPublic && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>

                      {snippet.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {snippet.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {snippet.blockType}
                          </span>
                          <span className="flex items-center">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {snippet.usageCount} uses
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => applySnippet(snippet)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Insert
                          </button>
                          <button
                            onClick={() => setSelectedSnippet(snippet)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSnippet(snippet.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {snippet.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {snippet.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{snippet.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}