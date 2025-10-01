"use client";

import { useState, useCallback } from 'react';
import { RevisionType } from '@prisma/client';

interface CreateRevisionOptions {
  contentId: string;
  changesSummary?: string;
  changeType?: RevisionType;
  createdBy?: string;
}

export function useRevisionHistory() {
  const [isCreatingRevision, setIsCreatingRevision] = useState(false);

  // Create a new revision
  const createRevision = useCallback(async (options: CreateRevisionOptions) => {
    try {
      setIsCreatingRevision(true);

      const response = await fetch(`/api/content/${options.contentId}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changesSummary: options.changesSummary,
          changeType: options.changeType || RevisionType.EDIT,
          createdBy: options.createdBy || 'Sid' // In a real app, this would come from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create revision');
      }

      const result = await response.json();
      return result.revisionId;
    } catch (error) {
      console.error('Error creating revision:', error);
      throw error;
    } finally {
      setIsCreatingRevision(false);
    }
  }, []);

  // Auto-create revision when content changes
  const createAutoRevision = useCallback(async (contentId: string, changeType: RevisionType = RevisionType.EDIT) => {
    try {
      await createRevision({
        contentId,
        changesSummary: 'Auto-saved changes',
        changeType,
        createdBy: 'Sid' // In a real app, this would come from auth
      });
    } catch (error) {
      // Auto-revisions failing shouldn't break the user experience
      console.warn('Failed to create auto-revision:', error);
    }
  }, [createRevision]);

  return {
    createRevision,
    createAutoRevision,
    isCreatingRevision
  };
}