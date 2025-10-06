"use client";

interface FeaturedLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeaturedLimitModal({ isOpen, onClose }: FeaturedLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Featured Carousel Limit Reached
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          You can only have <span className="font-semibold text-gray-900">5 posts</span> in the Featured Section Carousel. Please unfeature another post first before featuring this one.
        </p>

        {/* Counter Badge */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
          <div className="text-4xl font-bold text-red-600 mb-1">5/5</div>
          <div className="text-sm text-red-700">Featured Posts</div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
