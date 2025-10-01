"use client";

import { useState } from "react";

interface CurrentFeatured {
  id: string;
  title: string;
  description: string;
  contentType: string;
}

interface ConfirmFeaturedReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentFeatured: CurrentFeatured | null;
  newContentTitle: string;
  isLoading?: boolean;
}

export default function ConfirmFeaturedReplaceModal({
  isOpen,
  onClose,
  onConfirm,
  currentFeatured,
  newContentTitle,
  isLoading = false
}: ConfirmFeaturedReplaceModalProps) {
  console.log('🪟 Modal render:', { isOpen, currentFeatured: !!currentFeatured, newContentTitle });

  if (!isOpen || !currentFeatured) {
    console.log('🪟 Modal not rendering - isOpen:', isOpen, 'currentFeatured:', !!currentFeatured);
    return null;
  }

  const contentTypeLabels = {
    blog: 'Blog',
    project: 'Project',
    case_study: 'Case Study',
    tutorial: 'Tutorial',
    news: 'News'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Replace Featured Content?
              </h3>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              You already have featured content. Featuring &ldquo;<strong>{newContentTitle}</strong>&rdquo; will replace the current featured content.
            </p>

            {/* Current Featured Content Preview */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm">Current Featured Content</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {contentTypeLabels[currentFeatured.contentType as keyof typeof contentTypeLabels] || currentFeatured.contentType}
                </span>
              </div>
              <h5 className="font-semibold text-gray-800 mb-1">{currentFeatured.title}</h5>
              <p className="text-sm text-gray-600 line-clamp-2">{currentFeatured.description}</p>
            </div>

            <div className="flex items-center justify-center my-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* New Featured Content Preview */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center mb-2">
                <h4 className="font-medium text-gray-900 text-sm">New Featured Content</h4>
              </div>
              <h5 className="font-semibold text-green-800">{newContentTitle}</h5>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Replacing...
                </>
              ) : (
                'Replace Featured'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}