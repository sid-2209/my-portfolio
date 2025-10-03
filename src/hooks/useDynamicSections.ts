import { useMemo } from 'react';
import { ContentBlock, BlockType } from '@prisma/client';

export interface DynamicSection {
  id: string;
  label: string;
  type: 'hero' | 'intro' | 'content' | 'footer';
  elementId: string;
  blockIndex?: number;
}

interface HeadingData {
  text: string;
  level: number;
}

/**
 * Strips HTML tags from text to extract plain text for labels
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Finds the nearest heading block to a divider for section labeling
 * Searches forward first (up to 5 blocks), then backward (up to 3 blocks)
 */
function findNearestHeading(blocks: ContentBlock[], dividerIndex: number): string | null {
  // Search forward first (5 blocks ahead) - preferred direction
  for (let i = dividerIndex + 1; i < Math.min(dividerIndex + 6, blocks.length); i++) {
    if (blocks[i].blockType === 'HEADING') {
      const headingData = blocks[i].data as unknown as HeadingData;
      const cleanText = stripHtmlTags(headingData.text || '');
      if (cleanText) return cleanText;
    }
  }

  // Search backward (3 blocks back) as fallback
  for (let i = dividerIndex - 1; i >= Math.max(dividerIndex - 3, 0); i--) {
    if (blocks[i].blockType === 'HEADING') {
      const headingData = blocks[i].data as unknown as HeadingData;
      const cleanText = stripHtmlTags(headingData.text || '');
      if (cleanText) return cleanText;
    }
  }

  return null;
}

/**
 * Finds the first heading in the content blocks for the intro section
 */
function findFirstHeading(blocks: ContentBlock[]): string | null {
  for (let i = 0; i < Math.min(5, blocks.length); i++) {
    if (blocks[i].blockType === 'HEADING') {
      const headingData = blocks[i].data as unknown as HeadingData;
      const cleanText = stripHtmlTags(headingData.text || '');
      if (cleanText) return cleanText;
    }
  }
  return null;
}

/**
 * Analyzes content blocks to generate dynamic sections based on dividers
 * Formula: divider_count + 2 (hero + footer)
 */
export function useDynamicSections(
  contentBlocks: { id: string; blockType: string; data: unknown; order: number }[] | undefined,
  contentTitle: string
): DynamicSection[] {
  return useMemo(() => {
    const sections: DynamicSection[] = [];

    // Always add hero section first
    sections.push({
      id: 'hero-section',
      label: contentTitle || 'Introduction',
      type: 'hero',
      elementId: 'hero'
    });

    // Handle missing or empty content blocks
    if (!contentBlocks || contentBlocks.length === 0) {
      // Default to 3 sections: Hero, Content, Footer
      sections.push({
        id: 'intro-section',
        label: 'Content',
        type: 'intro',
        elementId: 'content-start'
      });

      sections.push({
        id: 'footer-section',
        label: 'Tags & More',
        type: 'footer',
        elementId: 'tags-footer'
      });

      return sections;
    }

    // Convert to ContentBlock format for processing
    const blocks: ContentBlock[] = contentBlocks.map(block => ({
      ...block,
      blockType: block.blockType as BlockType,
      contentId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      data: block.data as Record<string, unknown>
    }));

    // Find first divider index
    const firstDividerIndex = blocks.findIndex(block => block.blockType === 'DIVIDER');

    // Add intro section (content before first divider or first heading)
    const introLabel = findFirstHeading(blocks) || 'Introduction';
    sections.push({
      id: 'intro-section',
      label: introLabel,
      type: 'intro',
      elementId: 'content-start'
    });

    // Process divider blocks to create content sections
    let sectionCounter = 1;
    blocks.forEach((block, index) => {
      if (block.blockType === 'DIVIDER') {
        const label = findNearestHeading(blocks, index) || `Section ${sectionCounter}`;
        sections.push({
          id: `content-section-${index}`,
          label,
          type: 'content',
          elementId: `divider-section-${index}`,
          blockIndex: index
        });
        sectionCounter++;
      }
    });

    // Always add footer section last
    sections.push({
      id: 'footer-section',
      label: 'Tags & More',
      type: 'footer',
      elementId: 'tags-footer'
    });

    return sections;
  }, [contentBlocks, contentTitle]);
}
