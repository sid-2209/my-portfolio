"use client";

import { useState, useRef, useEffect } from "react";

interface DividerData {
  style: 'solid' | 'dashed' | 'dotted' | 'double';
  color: string;
  thickness?: number;
  width?: number;
  marginTop?: number;
  marginBottom?: number;
}

interface DividerEditorProps {
  data: DividerData;
  onChange: (data: DividerData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function DividerEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: DividerEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<DividerData>({
    ...{
      style: 'solid' as const,
      color: '#e5e7eb',
      thickness: 1,
      width: 100,
      marginTop: 20,
      marginBottom: 20
    },
    ...data
  });
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('custom');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentData({
      ...{
        style: 'solid' as const,
        color: '#e5e7eb',
        thickness: 1,
        width: 100,
        marginTop: 20,
        marginBottom: 20
      },
      ...data
    });
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (field: keyof DividerData, value: string | number) => {
    const newData = { ...currentData, [field]: value };
    setCurrentData(newData);
    setIsTyping(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the onChange call
    timeoutRef.current = setTimeout(() => {
      onChange(newData);
      setIsTyping(false);
    }, 300);
  };

  const presets = [
    {
      id: 'subtle',
      name: 'Subtle',
      data: { style: 'solid' as const, color: '#f3f4f6', thickness: 1, width: 100, marginTop: 16, marginBottom: 16 }
    },
    {
      id: 'standard',
      name: 'Standard',
      data: { style: 'solid' as const, color: '#e5e7eb', thickness: 1, width: 100, marginTop: 24, marginBottom: 24 }
    },
    {
      id: 'bold',
      name: 'Bold',
      data: { style: 'solid' as const, color: '#6b7280', thickness: 2, width: 100, marginTop: 32, marginBottom: 32 }
    },
    {
      id: 'dashed',
      name: 'Dashed',
      data: { style: 'dashed' as const, color: '#9ca3af', thickness: 1, width: 100, marginTop: 20, marginBottom: 20 }
    },
    {
      id: 'dotted',
      name: 'Dotted',
      data: { style: 'dotted' as const, color: '#9ca3af', thickness: 2, width: 100, marginTop: 20, marginBottom: 20 }
    },
    {
      id: 'decorative',
      name: 'Decorative',
      data: { style: 'double' as const, color: '#4f46e5', thickness: 3, width: 60, marginTop: 32, marginBottom: 32 }
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setSelectedPreset(preset.id);
    setCurrentData({ ...currentData, ...preset.data });
    onChange({ ...currentData, ...preset.data });
  };

  const colorOptions = [
    { name: 'Light Gray', value: '#f3f4f6' },
    { name: 'Gray', value: '#e5e7eb' },
    { name: 'Dark Gray', value: '#6b7280' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Black', value: '#000000' }
  ];

  if (!mounted) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">Divider Block</h3>
        <p className="text-sm text-gray-600 mt-1">Add visual separation between content sections</p>
      </div>

      {/* Editor Content */}
      <div className="p-4 space-y-6">
        {/* Preset Styles */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-3">
            Quick Presets
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`p-3 border rounded-lg text-left transition-all ${
                  selectedPreset === preset.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {preset.name}
                </div>
                <div className="flex items-center justify-center py-2">
                  <hr
                    style={{
                      borderStyle: preset.data.style,
                      borderColor: preset.data.color,
                      borderWidth: `${preset.data.thickness}px 0 0 0`,
                      width: `${preset.data.width}%`,
                      margin: 0
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Custom Settings</h4>

          {/* Style Type */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Line Style
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['solid', 'dashed', 'dotted', 'double'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => {
                    handleChange('style', style);
                    setSelectedPreset('custom');
                  }}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    currentData.style === style
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-900 mb-2 capitalize">
                    {style}
                  </div>
                  <hr
                    style={{
                      borderStyle: style,
                      borderColor: '#6b7280',
                      borderWidth: '2px 0 0 0',
                      margin: 0
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    handleChange('color', color.value);
                    setSelectedPreset('custom');
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    currentData.color === color.value
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={currentData.color}
                onChange={(e) => {
                  handleChange('color', e.target.value);
                  setSelectedPreset('custom');
                }}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={currentData.color}
                onChange={(e) => {
                  handleChange('color', e.target.value);
                  setSelectedPreset('custom');
                }}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Thickness ({currentData.thickness}px)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={currentData.thickness}
                onChange={(e) => {
                  handleChange('thickness', parseInt(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Width ({currentData.width}%)
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={currentData.width}
                onChange={(e) => {
                  handleChange('width', parseInt(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Spacing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Top Margin ({currentData.marginTop}px)
              </label>
              <input
                type="range"
                min="0"
                max="80"
                value={currentData.marginTop}
                onChange={(e) => {
                  handleChange('marginTop', parseInt(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Bottom Margin ({currentData.marginBottom}px)
              </label>
              <input
                type="range"
                min="0"
                max="80"
                value={currentData.marginBottom}
                onChange={(e) => {
                  handleChange('marginBottom', parseInt(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-3">
            Preview
          </label>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">Content above divider</div>
            <div
              style={{
                marginTop: `${currentData.marginTop}px`,
                marginBottom: `${currentData.marginBottom}px`,
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <hr
                style={{
                  border: 'none',
                  borderTop: `${currentData.thickness}px ${currentData.style} ${currentData.color}`,
                  width: `${currentData.width}%`,
                  margin: 0
                }}
              />
            </div>
            <div className="text-sm text-gray-600 mt-2">Content below divider</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedPreset !== 'custom' ? `Using ${presets.find(p => p.id === selectedPreset)?.name} preset` : 'Custom divider'}
          </div>
          {isTyping && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}