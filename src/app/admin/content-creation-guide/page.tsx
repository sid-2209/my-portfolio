"use client";

import { useState } from "react";
import RichTextEditor from "../../../components/cms/RichTextEditor";
import SplitViewEditor from "../../../components/cms/SplitViewEditor";
import CodeBlockEditor from "../../../components/cms/CodeBlockEditor";
import EnhancedBlockEditor from "../../../components/cms/EnhancedBlockEditor";

export default function ContentCreationGuidePage() {
  const [blogContent, setBlogContent] = useState(`<h1>Building a Modern Content Management System</h1>
<p>In today's digital landscape, having a robust content management system is crucial for businesses and developers alike. This guide will walk you through creating professional content using advanced editing tools.</p>

<h2>Key Features of Our CMS</h2>
<ul>
<li><strong>Rich Text Editing:</strong> WYSIWYG interface for intuitive content creation</li>
<li><strong>Markdown Support:</strong> Flexible markdown editing with live preview</li>
<li><strong>Code Highlighting:</strong> Syntax highlighting for 22+ programming languages</li>
<li><strong>Advanced Formatting:</strong> Professional formatting tools and elements</li>
</ul>

<h2>Getting Started</h2>
<p>Choose your preferred editing mode and start creating content. You can switch between rich text and markdown modes seamlessly.</p>`);

  const [markdownContent, setMarkdownContent] = useState(`# Advanced Content Creation Guide

## Rich Text vs Markdown

When creating content, you have two powerful options:

### Rich Text Editor
- **WYSIWYG Interface**: What you see is what you get
- **Visual Formatting**: Easy-to-use toolbar with formatting options
- **Real-time Preview**: See changes as you type
- **HTML Output**: Generates clean, semantic HTML

### Markdown Editor
- **Syntax-based**: Use markdown syntax for formatting
- **Keyboard Shortcuts**: Faster typing with markdown shortcuts
- **Version Control Friendly**: Easy to track changes in git
- **Portable**: Works across different platforms

## Code Examples

\`\`\`javascript
// Example: Creating a content block
const createContentBlock = (type, data) => {
  return {
    id: generateId(),
    type: type,
    data: data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
\`\`\`

## Best Practices

1. **Use Headings Properly**: Create a clear hierarchy with H1, H2, H3
2. **Break Content**: Use lists and paragraphs for readability
3. **Include Code**: Use code blocks with proper language specification
4. **Add Images**: Include relevant images with proper alt text

> **Pro Tip**: Start with an outline in markdown, then switch to rich text for detailed editing.
`);

  const [codeExample, setCodeExample] = useState(`// React Component Example
import React, { useState, useEffect } from 'react';

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'code' | 'image';
  data: any;
  order: number;
}

const ContentEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const addBlock = (type: string, data: any) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: type as any,
      data,
      order: blocks.length
    };
    
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (id: string, data: any) => {
    setBlocks(prev => 
      prev.map(block => 
        block.id === id ? { ...block, data, updatedAt: new Date() } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  return (
    <div className="content-editor">
      <div className="toolbar">
        <button onClick={() => addBlock('paragraph', { text: '' })}>
          Add Paragraph
        </button>
        <button onClick={() => addBlock('heading', { text: '', level: 2 })}>
          Add Heading
        </button>
        <button onClick={() => addBlock('code', { code: '', language: 'javascript' })}>
          Add Code Block
        </button>
      </div>
      
      <div className="blocks">
        {blocks.map((block, index) => (
          <div key={block.id} className="block">
            {/* Block content rendering */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentEditor;`);

  const [codeLanguage, setCodeLanguage] = useState("typescript");

  // Sample blocks for demonstration
  const sampleBlocks = [
    {
      id: '1',
      contentId: '1',
      blockType: 'HEADING',
      order: 0,
      data: { text: 'Professional Content Creation', level: 1 },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      contentId: '1',
      blockType: 'PARAGRAPH',
      order: 1,
      data: { text: 'Learn how to create professional content using our advanced CMS features. This guide demonstrates all the powerful tools available for content creators.' },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      contentId: '1',
      blockType: 'CODE_BLOCK',
      order: 2,
      data: { code: codeExample, language: codeLanguage },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Content Creation Guide</h1>
          <p className="text-lg text-gray-600">Master the art of creating professional content using our advanced CMS features</p>
        </div>

        {/* Content Creation Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rich Text Editor Example */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Rich Text Editor Example</h2>
            <p className="text-sm text-gray-600 mb-4">
              Create content with a visual, WYSIWYG interface. Perfect for users who prefer seeing their formatting as they type.
            </p>
            <RichTextEditor
              content={blogContent}
              onChange={(content) => setBlogContent(typeof content === 'string' ? content : content.text)}
              placeholder="Start writing your blog post..."
            />
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Features Demonstrated:</strong> Headings, paragraphs, lists, bold text, and rich formatting options.
              </p>
            </div>
          </div>

          {/* Markdown Editor Example */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Markdown Editor Example</h2>
            <p className="text-sm text-gray-600 mb-4">
              Write content using markdown syntax with live preview. Ideal for developers and power users.
            </p>
            <SplitViewEditor
              content={markdownContent}
              onChange={setMarkdownContent}
              placeholder="Write your markdown content here..."
            />
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Features Demonstrated:</strong> Markdown syntax, live preview, code blocks, and structured content.
              </p>
            </div>
          </div>
        </div>

        {/* Code Editor Example */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Code Editor with Syntax Highlighting</h2>
          <p className="text-sm text-gray-600 mb-4">
            Create and edit code blocks with syntax highlighting for 22+ programming languages. Perfect for technical documentation and tutorials.
          </p>
          <CodeBlockEditor
            code={codeExample}
            language={codeLanguage}
            onChange={(code, language) => {
              setCodeExample(code);
              setCodeLanguage(language);
            }}
          />
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-700">
              <strong>Features Demonstrated:</strong> Syntax highlighting, language selection, line numbers, font size control, and code copying.
            </p>
          </div>
        </div>

        {/* Enhanced Block Editor Examples */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Block-Based Content Management</h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage content as individual blocks that can be edited, reordered, and styled independently. This approach provides maximum flexibility and control.
          </p>
          
          <div className="space-y-4">
            {sampleBlocks.map((block, index) => (
              <EnhancedBlockEditor
                key={block.id}
                block={block}
                onUpdate={(data) => {
                  console.log(`Block ${index + 1} updated:`, data);
                  // Update the corresponding content
                  if (block.blockType === 'PARAGRAPH') {
                    const paragraphData = data as { text: string };
                    const currentData = block.data as { text: string };
                    setBlogContent(prev => prev.replace(currentData.text || '', paragraphData.text || ''));
                  } else if (block.blockType === 'CODE_BLOCK') {
                    const codeData = data as { code: string; language: string };
                    setCodeExample(codeData.code || '');
                    setCodeLanguage(codeData.language || 'javascript');
                  }
                }}
                onDelete={() => console.log(`Block ${index + 1} deleted`)}
                onMoveUp={() => console.log(`Block ${index + 1} moved up`)}
                onMoveDown={() => console.log(`Block ${index + 1} moved down`)}
                isFirst={index === 0}
                isLast={index === sampleBlocks.length - 1}
              />
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>Features Demonstrated:</strong> Block editing, mode switching, content management, and professional UI interactions.
            </p>
          </div>
        </div>

        {/* Content Creation Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Creation Best Practices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Structure & Organization</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Start with a clear outline and main heading</li>
                <li>• Use subheadings to break content into logical sections</li>
                <li>• Keep paragraphs short and focused (2-3 sentences)</li>
                <li>• Use lists and bullet points for easy scanning</li>
                <li>• Include relevant code examples with proper syntax highlighting</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Formatting & Style</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use bold text to emphasize key points</li>
                <li>• Include blockquotes for important information</li>
                <li>• Add images and media to enhance understanding</li>
                <li>• Use consistent formatting throughout your content</li>
                <li>• Test your content in both edit and preview modes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Editor Mode Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Feature</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Rich Text</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Markdown</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Code Editor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Ease of Use</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Formatting Speed</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Code Support</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐⭐</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Visual Feedback</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐</td>
                  <td className="border border-gray-300 px-4 py-2">⭐⭐⭐⭐</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Best For</td>
                  <td className="border border-gray-300 px-4 py-2">General content, blogs, articles</td>
                  <td className="border border-gray-300 px-4 py-2">Technical docs, developer content</td>
                  <td className="border border-gray-300 px-4 py-2">Code examples, tutorials</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Next Steps</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>1.</strong> Practice using each editor mode with different types of content</p>
            <p><strong>2.</strong> Experiment with the advanced formatting tools and special elements</p>
            <p><strong>3.</strong> Create a complete blog post or tutorial using all the features</p>
            <p><strong>4.</strong> Test the content in different view modes and devices</p>
            <p><strong>5.</strong> Integrate these tools into your content workflow</p>
          </div>
        </div>
      </div>
    </div>
  );
}
