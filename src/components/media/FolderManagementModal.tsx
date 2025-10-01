"use client";

import { useState } from "react";
import {
  X,
  Folder,
  Plus,
  Edit3,
  Trash2,
  Save
} from "lucide-react";

interface FolderItem {
  name: string;
  label: string;
  description: string;
  count: number;
  editable: boolean;
}

interface FolderManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated?: (folderName: string) => void;
}

const DEFAULT_FOLDERS = [
  { name: 'general', label: 'General', description: 'General media files', count: 0, editable: false },
  { name: 'content', label: 'Content', description: 'Content-related media', count: 0, editable: false },
  { name: 'blocks', label: 'Content Blocks', description: 'Media from content blocks', count: 0, editable: false },
  { name: 'featured', label: 'Featured Images', description: 'Featured images for content', count: 0, editable: false },
  { name: 'thumbnails', label: 'Thumbnails', description: 'Thumbnail images', count: 0, editable: false }
];

export default function FolderManagementModal({
  isOpen,
  onClose,
  onFolderCreated
}: FolderManagementModalProps) {
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const folderName = newFolderName.trim().toLowerCase().replace(/\s+/g, '-');

    // Check if folder already exists
    if (folders.some(f => f.name === folderName)) {
      alert('A folder with this name already exists');
      return;
    }

    const newFolder = {
      name: folderName,
      label: newFolderName.trim(),
      description: `Custom folder: ${newFolderName.trim()}`,
      count: 0,
      editable: true
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');

    if (onFolderCreated) {
      onFolderCreated(folderName);
    }
  };

  const handleStartEdit = (folder: FolderItem) => {
    setEditingId(folder.name);
    setEditingName(folder.label);
  };

  const handleSaveEdit = (folderName: string) => {
    if (!editingName.trim()) return;

    setFolders(prev => prev.map(f =>
      f.name === folderName
        ? { ...f, label: editingName.trim(), description: `Custom folder: ${editingName.trim()}` }
        : f
    ));

    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (folderName: string) => {
    const folder = folders.find(f => f.name === folderName);
    if (!folder?.editable) {
      alert('Cannot delete system folders');
      return;
    }

    if (folder.count > 0) {
      alert('Cannot delete folders that contain media files');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete the folder "${folder.label}"?`);
    if (confirmed) {
      setFolders(prev => prev.filter(f => f.name !== folderName));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Manage Folders</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Create New Folder */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Create New Folder</h4>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Folder names will be automatically converted to lowercase with hyphens
          </p>
        </div>

        {/* Existing Folders */}
        <div className="flex-1 overflow-y-auto">
          <h4 className="font-semibold text-gray-900 mb-4">Existing Folders</h4>
          <div className="space-y-3">
            {folders.map((folder) => (
              <div key={folder.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    {editingId === folder.name ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(folder.name)}
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{folder.label}</p>
                    )}
                    <p className="text-xs text-gray-500">{folder.description}</p>
                    <p className="text-xs text-gray-400">{folder.count} files</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {editingId === folder.name ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(folder.name)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {folder.editable && (
                        <>
                          <button
                            onClick={() => handleStartEdit(folder)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(folder.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {!folder.editable && (
                        <span className="text-xs text-gray-400 px-2 py-1 bg-gray-200 rounded">
                          System
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a preview of folder management. Full folder API integration is coming soon.
            Currently, you can organize files using the existing folder options in the upload and edit modals.
          </p>
        </div>
      </div>
    </div>
  );
}