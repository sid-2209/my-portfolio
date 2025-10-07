'use client';

import { useState } from 'react';
import { ShareIcon } from './Icons';

interface SharePostProps {
  postId: string;
  postTitle?: string;
  className?: string;
  size?: number;
}

export default function SharePost({
  postId,
  postTitle = 'this post',
  className = '',
  size = 20
}: SharePostProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers

    // Construct the post URL
    const postUrl = `${window.location.origin}/content/${postId}`;

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(postUrl);

      // Show feedback
      setCopied(true);

      // Reset feedback after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);

      // Fallback for browsers that don't support clipboard API
      try {
        const textarea = document.createElement('textarea');
        textarea.value = postUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`relative group inline-flex items-center gap-2 transition-all duration-300 ${className}`}
      aria-label={`Share ${postTitle}`}
      title="Copy link to clipboard"
    >
      {/* Share Icon - Monochrome with hover effect */}
      <div className="transition-all duration-300 text-white/60 hover:text-white">
        <ShareIcon size={size} />
      </div>

      {/* Copied feedback tooltip */}
      {copied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1.5 rounded-md text-xs michroma whitespace-nowrap animate-fade-in">
          Link copied!
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
        </div>
      )}
    </button>
  );
}
