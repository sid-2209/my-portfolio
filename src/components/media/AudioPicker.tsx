'use client';

import { useState, useRef } from 'react';
import { Upload, Music as MusicIcon, X, Edit, Eye, Play, Pause } from 'lucide-react';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  blobUrl: string;
  altText?: string | null;
  caption?: string | null;
  size: number;
  mimetype: string;
  duration?: number | null;
  createdAt: string;
}

interface AudioPickerProps {
  value?: string; // Current audio URL
  onChange: (media: MediaItem | null) => void;
  onUrlChange?: (url: string) => void; // For backward compatibility
  label?: string;
  folder?: string; // Auto-organize by source
  source: string; // Track where audio is used
  contentId?: string; // Link to content if applicable
  blockId?: string; // If from content block
  className?: string;
  placeholder?: string;
}

export default function AudioPicker({
  value,
  onChange,
  onUrlChange,
  label = "Audio File",
  folder = "general",
  source,
  contentId,
  blockId,
  className = "",
  placeholder = "No audio selected"
}: AudioPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type (audio files)
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, OGG, M4A, FLAC)');
      return;
    }

    // Validate file size (50MB for audio)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size too large. Maximum size is 50MB for audio files.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('folder', folder);
      formData.append('source', source);
      formData.append('uploadedBy', 'Sid'); // TODO: Get from auth context

      if (contentId) {
        formData.append('contentId', contentId);
      }

      if (blockId) {
        formData.append('blockId', blockId);
      }

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      if (result.success && result.media && result.media.length > 0) {
        const uploadedMedia = result.media[0];
        onChange(uploadedMedia);
        if (onUrlChange) {
          onUrlChange(uploadedMedia.blobUrl);
        }
        setIsModalOpen(false);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload audio file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>

      {/* Current audio display */}
      {value ? (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              className="flex-shrink-0 p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {value.split('/').pop()?.replace(/-/g, ' ') || 'Audio file'}
              </p>
              <audio
                ref={audioRef}
                src={value}
                onEnded={() => setPlaying(false)}
                className="hidden"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                title="Change audio"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onChange(null);
                  if (onUrlChange) onUrlChange('');
                  setPlaying(false);
                }}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Remove audio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
        >
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <MusicIcon className="w-8 h-8" />
            <span className="text-sm font-medium">{placeholder}</span>
            <span className="text-xs">Click to upload audio</span>
          </div>
        </button>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !uploading && setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upload Audio File</h3>
              <button
                onClick={() => !uploading && setIsModalOpen(false)}
                disabled={uploading}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Drag and Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                  disabled={uploading}
                />

                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-base font-medium text-gray-900 mb-1">
                      {uploading ? 'Uploading...' : 'Drop audio file here'}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                      >
                        browse files
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported: MP3, WAV, OGG, M4A, FLAC (max 50MB)
                    </p>
                  </div>

                  {uploading && (
                    <div className="w-full max-w-xs">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
