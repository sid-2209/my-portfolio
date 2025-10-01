"use client";

import { useState, useEffect, useCallback } from 'react';

interface PreviewBlock {
  id: string;
  blockType: string;
  data: unknown;
  order: number;
}

interface ContentMetadata {
  title?: string;
  description?: string;
  contentType?: string;
  status?: string;
}

interface UseLivePreviewOptions {
  autoUpdate?: boolean;
  debounceMs?: number;
}

export function useLivePreview(
  initialBlocks: PreviewBlock[] = [],
  initialMetadata: ContentMetadata = {},
  options: UseLivePreviewOptions = {}
) {
  const { autoUpdate = true, debounceMs = 300 } = options;

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<PreviewBlock[]>(initialBlocks);
  const [contentMetadata, setContentMetadata] = useState<ContentMetadata>(initialMetadata);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize with data - only update if content actually changed
  useEffect(() => {
    setPreviewBlocks(prev => {
      // Check if blocks have actually changed
      if (JSON.stringify(prev) !== JSON.stringify(initialBlocks)) {
        return initialBlocks;
      }
      return prev;
    });

    setContentMetadata(prev => {
      // Check if metadata has actually changed
      if (JSON.stringify(prev) !== JSON.stringify(initialMetadata)) {
        return initialMetadata;
      }
      return prev;
    });
  }, [initialBlocks, initialMetadata]);

  // Debounced update function
  const debouncedUpdate = useCallback((
    blocks: PreviewBlock[],
    metadata: ContentMetadata
  ) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    const timeout = setTimeout(() => {
      setPreviewBlocks(blocks);
      setContentMetadata(metadata);
      setLastUpdated(new Date());
    }, debounceMs);

    setUpdateTimeout(timeout);
  }, [debounceMs, updateTimeout]);

  // Update preview blocks
  const updatePreviewBlocks = useCallback((
    blocks: PreviewBlock[],
    metadata?: ContentMetadata
  ) => {
    if (autoUpdate) {
      debouncedUpdate(blocks, metadata || contentMetadata);
    } else {
      setPreviewBlocks(blocks);
      if (metadata) {
        setContentMetadata(metadata);
      }
    }
  }, [autoUpdate, debouncedUpdate, contentMetadata]);

  // Update single block
  const updatePreviewBlock = useCallback((
    blockId: string,
    updatedData: unknown,
    blockType?: string
  ) => {
    const updatedBlocks = previewBlocks.map(block =>
      block.id === blockId
        ? { ...block, data: updatedData, ...(blockType && { blockType }) }
        : block
    );
    updatePreviewBlocks(updatedBlocks);
  }, [previewBlocks, updatePreviewBlocks]);

  // Add new block
  const addPreviewBlock = useCallback((
    block: Omit<PreviewBlock, 'order'>
  ) => {
    const maxOrder = previewBlocks.reduce((max, b) => Math.max(max, b.order), -1);
    const newBlock: PreviewBlock = {
      ...block,
      order: maxOrder + 1
    };
    updatePreviewBlocks([...previewBlocks, newBlock]);
  }, [previewBlocks, updatePreviewBlocks]);

  // Remove block
  const removePreviewBlock = useCallback((blockId: string) => {
    const updatedBlocks = previewBlocks.filter(block => block.id !== blockId);
    updatePreviewBlocks(updatedBlocks);
  }, [previewBlocks, updatePreviewBlocks]);

  // Reorder blocks
  const reorderPreviewBlocks = useCallback((
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(previewBlocks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order values
    const reorderedBlocks = result.map((block, index) => ({
      ...block,
      order: index
    }));

    updatePreviewBlocks(reorderedBlocks);
  }, [previewBlocks, updatePreviewBlocks]);

  // Update content metadata
  const updateContentMetadata = useCallback((metadata: Partial<ContentMetadata>) => {
    const updatedMetadata = { ...contentMetadata, ...metadata };
    setContentMetadata(updatedMetadata);
    if (autoUpdate) {
      debouncedUpdate(previewBlocks, updatedMetadata);
    }
  }, [contentMetadata, previewBlocks, autoUpdate, debouncedUpdate]);

  // Toggle preview visibility
  const togglePreviewVisibility = useCallback(() => {
    setIsPreviewVisible(prev => !prev);
  }, []);

  // Show preview
  const showPreview = useCallback(() => {
    setIsPreviewVisible(true);
  }, []);

  // Hide preview
  const hidePreview = useCallback(() => {
    setIsPreviewVisible(false);
  }, []);

  // Force refresh
  const refreshPreview = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    };
  }, [updateTimeout]);

  return {
    // State
    isPreviewVisible,
    previewBlocks,
    contentMetadata,
    lastUpdated,

    // Actions
    updatePreviewBlocks,
    updatePreviewBlock,
    addPreviewBlock,
    removePreviewBlock,
    reorderPreviewBlocks,
    updateContentMetadata,
    togglePreviewVisibility,
    showPreview,
    hidePreview,
    refreshPreview,

    // Computed
    blocksCount: previewBlocks.length,
    hasBlocks: previewBlocks.length > 0,
  };
}