"use client";

import { useState, useEffect } from "react";
import {
  History,
  RotateCcw,
  Clock,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Eye,
  ArrowUpDown
} from "lucide-react";

interface ContentRevision {
  id: string;
  revisionNumber: number;
  title: string;
  description?: string | null;
  status: string;
  changesSummary?: string | null;
  changeType: string;
  createdBy: string;
  createdAt: string;
  blockRevisions: Array<{
    id: string;
    blockType: string;
    order: number;
    changeType: string;
  }>;
}

interface RevisionHistoryPanelProps {
  contentId: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onRestoreRevision?: (revisionId: string) => void;
  className?: string;
}

export default function RevisionHistoryPanel({
  contentId,
  isVisible,
  onToggleVisibility,
  onRestoreRevision,
  className = ""
}: RevisionHistoryPanelProps) {
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRevisions, setExpandedRevisions] = useState<Set<string>>(new Set());
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareRevisions, setCompareRevisions] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && contentId) {
      fetchRevisions();
    }
  }, [isVisible, contentId]);

  const fetchRevisions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/content/${contentId}/revisions`);
      if (!response.ok) {
        if (response.status === 404) {
          // API endpoint not implemented yet, show empty state
          setRevisions([]);
          return;
        }
        throw new Error('Failed to fetch revisions');
      }
      const data = await response.json();
      setRevisions(data);
    } catch (error) {
      // Silently handle error and show empty state for now
      setRevisions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!confirm('Are you sure you want to restore to this revision? This will overwrite the current content.')) {
      return;
    }

    try {
      setIsRestoring(revisionId);
      const response = await fetch(`/api/content/${contentId}/revisions/${revisionId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restoredBy: 'Sid' // In a real app, this would come from auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore revision');
      }

      // Refresh revisions after restore
      await fetchRevisions();

      if (onRestoreRevision) {
        onRestoreRevision(revisionId);
      }

      alert('Content restored successfully!');
    } catch (error) {
      console.error('Error restoring revision:', error);
      alert('Failed to restore revision. Please try again.');
    } finally {
      setIsRestoring(null);
    }
  };

  const toggleExpanded = (revisionId: string) => {
    const newExpanded = new Set(expandedRevisions);
    if (newExpanded.has(revisionId)) {
      newExpanded.delete(revisionId);
    } else {
      newExpanded.add(revisionId);
    }
    setExpandedRevisions(newExpanded);
  };

  const handleCompareToggle = (revisionId: string) => {
    if (!compareMode) return;

    const newCompareRevisions = [...compareRevisions];
    const index = newCompareRevisions.indexOf(revisionId);

    if (index > -1) {
      newCompareRevisions.splice(index, 1);
    } else if (newCompareRevisions.length < 2) {
      newCompareRevisions.push(revisionId);
    }

    setCompareRevisions(newCompareRevisions);
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'EDIT': return 'bg-blue-100 text-blue-800';
      case 'PUBLISH': return 'bg-purple-100 text-purple-800';
      case 'UNPUBLISH': return 'bg-orange-100 text-orange-800';
      case 'FEATURE': return 'bg-yellow-100 text-yellow-800';
      case 'RESTORE': return 'bg-indigo-100 text-indigo-800';
      case 'ARCHIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="fixed top-20 right-4 z-50 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors"
        title="Show Revision History"
      >
        <History className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={`fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col ${className}`} style={{ width: '400px' }}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Revision History</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Compare Mode Toggle */}
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareRevisions([]);
            }}
            className={`p-2 rounded transition-colors ${
              compareMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Compare Revisions"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {/* Close Button */}
          <button
            onClick={onToggleVisibility}
            className="p-2 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded transition-colors"
            title="Hide Revision History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compare Actions */}
      {compareMode && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Select up to 2 revisions to compare ({compareRevisions.length}/2)
            </span>
            {compareRevisions.length === 2 && (
              <button
                onClick={() => {
                  // In a real implementation, this would open a compare view
                  alert('Compare functionality would open a detailed diff view');
                }}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Compare
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        ) : revisions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No revision history</p>
            <p className="text-sm mt-1">Changes will appear here as you edit content</p>
          </div>
        ) : (
          <div className="space-y-1">
            {revisions.map((revision, index) => {
              const isExpanded = expandedRevisions.has(revision.id);
              const isSelected = compareRevisions.includes(revision.id);
              const datetime = formatDateTime(revision.createdAt);
              const isLatest = index === 0;

              return (
                <div
                  key={revision.id}
                  className={`border-l-4 transition-colors ${
                    isSelected ? 'border-blue-500 bg-blue-50' :
                    isLatest ? 'border-green-500 bg-white' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="p-4">
                    {/* Revision Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {compareMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCompareToggle(revision.id)}
                            disabled={!isSelected && compareRevisions.length >= 2}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <button
                          onClick={() => toggleExpanded(revision.id)}
                          className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-gray-700"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span>Revision #{revision.revisionNumber}</span>
                          {isLatest && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </button>
                      </div>

                      {!isLatest && (
                        <button
                          onClick={() => handleRestoreRevision(revision.id)}
                          disabled={isRestoring === revision.id}
                          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          title="Restore to this revision"
                        >
                          {isRestoring === revision.id ? (
                            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          <span>Restore</span>
                        </button>
                      )}
                    </div>

                    {/* Change Type */}
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${getChangeTypeColor(revision.changeType)}`}>
                        {revision.changeType}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{datetime.date} at {datetime.time}</span>
                      </span>
                    </div>

                    {/* Author */}
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-2">
                      <User className="w-3 h-3" />
                      <span>by {revision.createdBy}</span>
                    </div>

                    {/* Changes Summary */}
                    {revision.changesSummary && (
                      <p className="text-sm text-gray-700 mb-2">
                        {revision.changesSummary}
                      </p>
                    )}

                    {/* Block Changes Summary */}
                    {revision.blockRevisions.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <FileText className="w-3 h-3" />
                        <span>{revision.blockRevisions.length} block{revision.blockRevisions.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Title:</span>
                            <span className="ml-2 text-gray-600">{revision.title}</span>
                          </div>

                          <div className="text-xs">
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className="ml-2 text-gray-600">{revision.status}</span>
                          </div>

                          {revision.blockRevisions.length > 0 && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">Blocks:</span>
                              <div className="ml-2 space-y-1">
                                {revision.blockRevisions.map((block, blockIndex) => (
                                  <div key={block.id} className="flex items-center space-x-2">
                                    <span className="text-gray-500">#{blockIndex + 1}</span>
                                    <span className="text-gray-600">{block.blockType}</span>
                                    <span className={`text-xs px-1 rounded ${
                                      block.changeType === 'ADDED' ? 'bg-green-100 text-green-700' :
                                      block.changeType === 'MODIFIED' ? 'bg-blue-100 text-blue-700' :
                                      block.changeType === 'REMOVED' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {block.changeType}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Auto-saves create revisions</span>
          <button
            onClick={fetchRevisions}
            className="text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}