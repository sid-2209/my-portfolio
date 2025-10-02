"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface TableData {
  headers: string[];
  rows: string[][];
  hasHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  alignment?: 'left' | 'center' | 'right';
}

interface TableEditorProps {
  data: TableData;
  onChange: (data: TableData) => void;
  className?: string;
  isEditing?: boolean;
}

export default function TableEditor({
  data,
  onChange,
  className = "",
  isEditing = false
}: TableEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [currentData, setCurrentData] = useState<TableData>(data);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentData(data);
  }, [data]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (field: keyof TableData, value: string[] | string[][] | boolean | string) => {
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

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...currentData.headers];
    newHeaders[index] = value;
    handleChange('headers', newHeaders);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = currentData.rows.map((row, rIdx) =>
      rIdx === rowIndex
        ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
        : row
    );
    handleChange('rows', newRows);
  };

  const addRow = () => {
    const newRow = new Array(currentData.headers.length).fill('');
    handleChange('rows', [...currentData.rows, newRow]);
  };

  const removeRow = (index: number) => {
    if (currentData.rows.length > 1) {
      const newRows = currentData.rows.filter((_, i) => i !== index);
      handleChange('rows', newRows);
    }
  };

  const addColumn = () => {
    const newHeaders = [...currentData.headers, `Column ${currentData.headers.length + 1}`];
    const newRows = currentData.rows.map(row => [...row, '']);
    setCurrentData({ ...currentData, headers: newHeaders, rows: newRows });
    setIsTyping(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange({ ...currentData, headers: newHeaders, rows: newRows });
      setIsTyping(false);
    }, 300);
  };

  const removeColumn = (index: number) => {
    if (currentData.headers.length > 1) {
      const newHeaders = currentData.headers.filter((_, i) => i !== index);
      const newRows = currentData.rows.map(row => row.filter((_, i) => i !== index));
      setCurrentData({ ...currentData, headers: newHeaders, rows: newRows });
      setIsTyping(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onChange({ ...currentData, headers: newHeaders, rows: newRows });
        setIsTyping(false);
      }, 300);
    }
  };

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

  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[currentData.alignment || 'left'];

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-900">Table Block</h3>
        <p className="text-sm text-gray-600 mt-1">Create responsive tables with custom styling</p>
      </div>

      {/* Editor Content */}
      <div className="p-4 space-y-4">
        {/* Table Controls */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={addRow}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
            <button
              onClick={addColumn}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Column
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {currentData.rows.length} rows × {currentData.headers.length} columns
          </div>
        </div>

        {/* Styling Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Alignment
            </label>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => handleChange('alignment', align)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm transition-all ${
                    (currentData.alignment || 'left') === align
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="capitalize">{align}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentData.hasHeader !== false}
                onChange={(e) => handleChange('hasHeader', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show header row</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentData.striped || false}
                onChange={(e) => handleChange('striped', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Striped rows</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentData.bordered !== false}
                onChange={(e) => handleChange('bordered', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show borders</span>
            </label>
          </div>
        </div>

        {/* Editable Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            {currentData.hasHeader !== false && (
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  {currentData.headers.map((header, index) => (
                    <th key={index} className="relative group">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(index, e.target.value)}
                        className={`w-full px-3 py-2 bg-transparent font-semibold text-gray-900 focus:outline-none focus:bg-white ${alignmentClass}`}
                        placeholder={`Header ${index + 1}`}
                      />
                      {currentData.headers.length > 1 && (
                        <button
                          onClick={() => removeColumn(index)}
                          className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </th>
                  ))}
                  <th className="w-12"></th>
                </tr>
              </thead>
            )}
            <tbody>
              {currentData.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`group ${
                    currentData.striped && rowIndex % 2 === 1 ? 'bg-gray-50' : ''
                  } ${currentData.bordered !== false ? 'border-b border-gray-200' : ''}`}
                >
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className={currentData.bordered !== false ? 'border-r border-gray-200' : ''}
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        className={`w-full px-3 py-2 bg-transparent text-gray-800 focus:outline-none focus:bg-white ${alignmentClass}`}
                        placeholder="Enter data"
                      />
                    </td>
                  ))}
                  <td className="w-12">
                    {currentData.rows.length > 1 && (
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Total cells: {currentData.rows.length * currentData.headers.length}
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
