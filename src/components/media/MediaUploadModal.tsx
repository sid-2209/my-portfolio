"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  File,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Folder
} from "lucide-react";

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  defaultFolder?: string;
  source?: string;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: { id: string; url: string; filename: string };
}

export default function MediaUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  defaultFolder = "general",
  source = "media-manager"
}: MediaUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const uploadFiles: UploadFile[] = fileArray.map(file => ({
      file,
      id: generateId(),
      status: 'pending',
      progress: 0
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('files', uploadFile.file);
      formData.append('folder', selectedFolder);
      formData.append('source', source);
      formData.append('uploadedBy', 'Sid'); // TODO: Get from auth context

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, progress } : f
          ));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                  ? { ...f, status: 'success', progress: 100, result: result.uploaded[0] }
                  : f
              ));
              resolve();
            } else {
              throw new Error(result.errors?.[0]?.error || 'Upload failed');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setFiles(prev => prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'error', error: errorMessage }
                : f
            ));
            reject(error);
          }
        } else {
          const errorMessage = `Upload failed: ${xhr.status}`;
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: errorMessage }
              : f
          ));
          reject(new Error(errorMessage));
        }
      };

      xhr.onerror = () => {
        const errorMessage = 'Network error during upload';
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'error', error: errorMessage }
            : f
        ));
        reject(new Error(errorMessage));
      };

      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
      ));

      xhr.open('POST', '/api/media/upload');
      xhr.send(formData);
    });
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files one by one to avoid overwhelming the server
      for (const file of pendingFiles) {
        try {
          await uploadFile(file);
        } catch (error) {
          console.error(`Failed to upload ${file.file.name}:`, error);
          // Continue with other files even if one fails
        }
      }

      // Call completion callback
      onUploadComplete();
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing during upload
    setFiles([]);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const successCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Upload Media</h3>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Folder Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload to Folder
          </label>
          <div className="relative">
            <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              disabled={isUploading}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="general">General</option>
              <option value="content">Content</option>
              <option value="blocks">Content Blocks</option>
              <option value="featured">Featured Images</option>
              <option value="thumbnails">Thumbnails</option>
            </select>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer mb-6 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : isUploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={isUploading ? undefined : () => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {dragActive ? 'Drop files here' : 'Drop files here or click to browse'}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              Support for JPG, PNG, GIF, WebP, MP4, and more
            </p>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Maximum file size: 10MB each</p>
              <p>Multiple files supported</p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                Files ({files.length})
              </h4>
              {successCount > 0 && (
                <span className="text-sm text-green-600">
                  {successCount} uploaded successfully
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-sm text-red-600">
                  {errorCount} failed
                </span>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-3">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadFile.file)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </p>

                    {/* Progress Bar */}
                    {uploadFile.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{uploadFile.progress}%</p>
                      </div>
                    )}

                    {/* Error Message */}
                    {uploadFile.status === 'error' && uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(uploadFile.status)}

                    {uploadFile.status === 'pending' && !isUploading && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {files.length > 0 && successCount === 0 ? 'Cancel' : 'Close'}
          </button>

          {pendingCount > 0 && (
            <button
              onClick={handleUploadAll}
              disabled={isUploading || pendingCount === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? 'Uploading...' : `Upload ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}