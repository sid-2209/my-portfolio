"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Minus,
  FileText,
  Image,
  Code,
  Quote,
  List,
  Layout,
  Divide,
  Settings,
  Save,
  Eye,
  Tag
} from "lucide-react";

interface TemplateCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: TemplateData) => void;
  mode: 'template' | 'snippet';
  editingTemplate?: TemplateData | null;
  editingSnippet?: SnippetData | null;
}

interface TemplateData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  contentType: string;
  isPublic: boolean;
  defaultTitle: string;
  defaultDescription: string;
  defaultAuthor: string;
  defaultTags: string[];
  defaultCategory: string;
  defaultFeatured: boolean;
  templateBlocks: TemplateBlockData[];
}

interface SnippetData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  blockType: string;
  isPublic: boolean;
  data: unknown;
}

interface TemplateBlockData {
  blockType: string;
  order: number;
  data: unknown;
  isRequired: boolean;
}

const BLOCK_TYPES = [
  { value: 'PARAGRAPH', label: 'Paragraph', icon: FileText },
  { value: 'HEADING', label: 'Heading', icon: Layout },
  { value: 'IMAGE', label: 'Image', icon: Image },
  { value: 'CODE_BLOCK', label: 'Code Block', icon: Code },
  { value: 'QUOTE', label: 'Quote', icon: Quote },
  { value: 'LIST', label: 'List', icon: List },
  { value: 'DIVIDER', label: 'Divider', icon: Divide },
  { value: 'CUSTOM', label: 'Custom', icon: Settings }
];

const CONTENT_TYPES = [
  'Article',
  'Blog Post',
  'Project',
  'Case Study',
  'Tutorial',
  'Documentation',
  'Portfolio Item',
  'News',
  'Review'
];

const CATEGORIES = [
  'Article Templates',
  'Project Templates',
  'Blog Templates',
  'Introduction Snippets',
  'Code Examples',
  'Quotes & Testimonials',
  'Call-to-Action',
  'Navigation',
  'Footer Content'
];

export default function TemplateCreationModal({
  isOpen,
  onClose,
  onSave,
  mode,
  editingTemplate,
  editingSnippet
}: TemplateCreationModalProps) {
  const [templateData, setTemplateData] = useState<TemplateData>({
    name: '',
    description: '',
    category: '',
    tags: [],
    contentType: 'Article',
    isPublic: false,
    defaultTitle: '',
    defaultDescription: '',
    defaultAuthor: 'Sid',
    defaultTags: [],
    defaultCategory: '',
    defaultFeatured: false,
    templateBlocks: []
  });

  const [snippetData, setSnippetData] = useState<SnippetData>({
    name: '',
    description: '',
    category: '',
    tags: [],
    blockType: 'PARAGRAPH',
    isPublic: false,
    data: {}
  });

  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'defaults' | 'blocks'>('basic');

  useEffect(() => {
    if (editingTemplate && mode === 'template') {
      setTemplateData({
        name: editingTemplate.name,
        description: editingTemplate.description,
        category: editingTemplate.category,
        tags: editingTemplate.tags,
        contentType: editingTemplate.contentType,
        isPublic: editingTemplate.isPublic,
        defaultTitle: editingTemplate.defaultTitle,
        defaultDescription: editingTemplate.defaultDescription,
        defaultAuthor: editingTemplate.defaultAuthor,
        defaultTags: editingTemplate.defaultTags,
        defaultCategory: editingTemplate.defaultCategory,
        defaultFeatured: editingTemplate.defaultFeatured,
        templateBlocks: editingTemplate.templateBlocks
      });
    } else if (editingSnippet && mode === 'snippet') {
      setSnippetData({
        name: editingSnippet.name,
        description: editingSnippet.description,
        category: editingSnippet.category,
        tags: editingSnippet.tags,
        blockType: editingSnippet.blockType,
        isPublic: editingSnippet.isPublic,
        data: editingSnippet.data
      });
    }
  }, [editingTemplate, editingSnippet, mode]);

  const addTag = (tagArray: string[], setData: (prev: unknown) => void, dataKey: string) => {
    if (newTag.trim() && !tagArray.includes(newTag.trim())) {
      if (mode === 'template') {
        setTemplateData(prev => ({
          ...prev,
          [dataKey]: [...tagArray, newTag.trim()]
        }));
      } else {
        setSnippetData(prev => ({
          ...prev,
          [dataKey]: [...tagArray, newTag.trim()]
        }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string, tagArray: string[], dataKey: string) => {
    if (mode === 'template') {
      setTemplateData(prev => ({
        ...prev,
        [dataKey]: tagArray.filter(tag => tag !== tagToRemove)
      }));
    } else {
      setSnippetData(prev => ({
        ...prev,
        [dataKey]: tagArray.filter(tag => tag !== tagToRemove)
      }));
    }
  };

  const addTemplateBlock = () => {
    const newBlock: TemplateBlockData = {
      blockType: 'PARAGRAPH',
      order: templateData.templateBlocks.length,
      data: {},
      isRequired: false
    };

    setTemplateData(prev => ({
      ...prev,
      templateBlocks: [...prev.templateBlocks, newBlock]
    }));
  };

  const updateTemplateBlock = (index: number, updates: Partial<TemplateBlockData>) => {
    setTemplateData(prev => ({
      ...prev,
      templateBlocks: prev.templateBlocks.map((block, i) =>
        i === index ? { ...block, ...updates } : block
      )
    }));
  };

  const removeTemplateBlock = (index: number) => {
    setTemplateData(prev => ({
      ...prev,
      templateBlocks: prev.templateBlocks
        .filter((_, i) => i !== index)
        .map((block, i) => ({ ...block, order: i }))
    }));
  };

  const handleSave = () => {
    if (mode === 'template') {
      onSave(templateData);
    } else {
      onSave(snippetData as unknown);
    }
  };

  const getBlockIcon = (blockType: string) => {
    const blockDef = BLOCK_TYPES.find(b => b.value === blockType);
    return blockDef ? blockDef.icon : FileText;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTemplate || editingSnippet ? 'Edit' : 'Create'} {mode === 'template' ? 'Template' : 'Snippet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {mode === 'template' ? (
            <div className="p-6">
              {/* Template Tabs */}
              <div className="flex space-x-1 mb-6 border-b">
                {['basic', 'defaults', 'blocks'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'basic' | 'defaults' | 'blocks')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg capitalize ${
                      activeTab === tab
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateData.name}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Blog Post Template"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={templateData.description}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe what this template is for..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content Type *
                      </label>
                      <select
                        value={templateData.contentType}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, contentType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {CONTENT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={templateData.category}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select category...</option>
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {templateData.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag, templateData.tags, 'tags')}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag(templateData.tags, setTemplateData, 'tags')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a tag..."
                      />
                      <button
                        onClick={() => addTag(templateData.tags, setTemplateData, 'tags')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={templateData.isPublic}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                      Make this template public (visible to all users)
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'defaults' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Set default values that will be pre-filled when this template is used.
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Title
                    </label>
                    <input
                      type="text"
                      value={templateData.defaultTitle}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, defaultTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter default title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Description
                    </label>
                    <textarea
                      value={templateData.defaultDescription}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, defaultDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter default description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Author
                      </label>
                      <input
                        type="text"
                        value={templateData.defaultAuthor}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, defaultAuthor: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Category
                      </label>
                      <input
                        type="text"
                        value={templateData.defaultCategory}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, defaultCategory: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter default category..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {templateData.defaultTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag, templateData.defaultTags, 'defaultTags')}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag(templateData.defaultTags, setTemplateData, 'defaultTags')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a default tag..."
                      />
                      <button
                        onClick={() => addTag(templateData.defaultTags, setTemplateData, 'defaultTags')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="defaultFeatured"
                      checked={templateData.defaultFeatured}
                      onChange={(e) => setTemplateData(prev => ({ ...prev, defaultFeatured: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="defaultFeatured" className="ml-2 block text-sm text-gray-900">
                      Default to featured content
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'blocks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Define the structure of content blocks for this template.
                    </p>
                    <button
                      onClick={addTemplateBlock}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Block
                    </button>
                  </div>

                  <div className="space-y-3">
                    {templateData.templateBlocks.map((block, index) => {
                      const BlockIcon = getBlockIcon(block.blockType);
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <BlockIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">Block {index + 1}</span>
                            </div>
                            <button
                              onClick={() => removeTemplateBlock(index)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Block Type
                              </label>
                              <select
                                value={block.blockType}
                                onChange={(e) => updateTemplateBlock(index, { blockType: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                              >
                                {BLOCK_TYPES.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-end">
                              <label className="flex items-center text-xs text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={block.isRequired}
                                  onChange={(e) => updateTemplateBlock(index, { isRequired: e.target.checked })}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-1"
                                />
                                Required
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {templateData.templateBlocks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Layout className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                        <p>No blocks added yet</p>
                        <p className="text-sm">Click &quot;Add Block&quot; to start building your template</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Snippet Form
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Snippet Name *
                </label>
                <input
                  type="text"
                  value={snippetData.name}
                  onChange={(e) => setSnippetData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Introduction Paragraph"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={snippetData.description}
                  onChange={(e) => setSnippetData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this snippet is for..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Block Type *
                  </label>
                  <select
                    value={snippetData.blockType}
                    onChange={(e) => setSnippetData(prev => ({ ...prev, blockType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {BLOCK_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={snippetData.category}
                    onChange={(e) => setSnippetData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {snippetData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag, snippetData.tags, 'tags')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag(snippetData.tags, setSnippetData, 'tags')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    onClick={() => addTag(snippetData.tags, setSnippetData, 'tags')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="snippetPublic"
                  checked={snippetData.isPublic}
                  onChange={(e) => setSnippetData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="snippetPublic" className="ml-2 block text-sm text-gray-900">
                  Make this snippet public (visible to all users)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-1 inline" />
            {editingTemplate || editingSnippet ? 'Update' : 'Create'} {mode === 'template' ? 'Template' : 'Snippet'}
          </button>
        </div>
      </div>
    </div>
  );
}