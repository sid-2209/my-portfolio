"use client";

import Link from "next/link";

export default function AdminMediaPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
            <p className="text-lg text-gray-600 mt-2">Organize and manage your digital assets</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upload Media
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Create Album
            </button>
          </div>
        </div>

        {/* Media Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-blue-600">🖼️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-600">Total Images</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-green-600">📹</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-sm text-gray-600">Videos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-yellow-600">📁</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-600">Albums</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-purple-600">💾</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
                <p className="text-sm text-gray-600">Storage Used</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Upload Media</h3>
                <p className="text-sm text-gray-600">Add new images, videos, and files</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Upload Now
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Organize Files</h3>
                <p className="text-sm text-gray-600">Create albums and organize content</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              Organize
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
                <p className="text-sm text-gray-600">Find specific media quickly</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              Search
            </button>
          </div>
        </div>

        {/* Media Library */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Media Library</h2>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>All Types</option>
                <option>Images</option>
                <option>Videos</option>
                <option>Documents</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Sort by Date</option>
                <option>Sort by Name</option>
                <option>Sort by Size</option>
              </select>
            </div>
          </div>

          {/* Sample Media Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="group relative">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-2xl text-gray-600">🖼️</span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                        <span className="text-sm">👁️</span>
                      </button>
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                        <span className="text-sm">✏️</span>
                      </button>
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100">
                        <span className="text-sm">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600 truncate">image-{i + 1}.jpg</p>
                  <p className="text-xs text-gray-500">{(Math.random() * 2 + 0.5).toFixed(1)} MB</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Uploads</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">🖼️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">hero-image.jpg</p>
                <p className="text-xs text-gray-600">Uploaded 2 hours ago • 1.2 MB</p>
              </div>
              <span className="text-xs text-blue-600">Image</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">📹</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">demo-video.mp4</p>
                <p className="text-xs text-gray-600">Uploaded 1 day ago • 15.7 MB</p>
              </div>
              <span className="text-xs text-green-600">Video</span>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">📄</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">presentation.pdf</p>
                <p className="text-xs text-gray-600">Uploaded 3 days ago • 2.8 MB</p>
              </div>
              <span className="text-xs text-yellow-600">Document</span>
            </div>
          </div>
        </div>

        {/* Storage Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Storage Information</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Images</span>
              <span className="text-sm font-medium text-gray-900">1.8 GB (75%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Videos</span>
              <span className="text-sm font-medium text-gray-900">0.4 GB (17%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '17%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Documents</span>
              <span className="text-sm font-medium text-gray-900">0.2 GB (8%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '8%' }}></div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Total Used</span>
                <span className="text-sm font-medium text-gray-900">2.4 GB / 10 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
