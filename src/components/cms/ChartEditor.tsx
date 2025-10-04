"use client";

import { useState, useEffect, useRef } from "react";
import { BarChart3, LineChart, PieChart, TrendingUp, Plus, Trash2, Code, Eye, Copy, Check, Sparkles, Download, Upload } from 'lucide-react';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animations?: boolean;
}

interface ChartEditorProps {
  // New universal chart fields
  framework?: 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom';
  code?: string;

  // Legacy visual editor fields (backwards compatible)
  chartType?: 'bar' | 'line' | 'area' | 'pie' | 'radar';
  data?: ChartDataPoint[];
  config?: ChartConfig;

  onChange: (framework: 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom' | undefined, code: string | undefined, chartType?: 'bar' | 'line' | 'area' | 'pie' | 'radar', data?: ChartDataPoint[], config?: ChartConfig) => void;
  className?: string;
}

const defaultColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export default function ChartEditor({
  framework: propFramework,
  code: propCode,
  chartType: propChartType,
  data: propData,
  config: propConfig,
  onChange,
  className = ""
}: ChartEditorProps) {
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('editor');

  // Visual editor state
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie' | 'radar'>(propChartType || 'bar');
  const [title, setTitle] = useState(propConfig?.title || '');
  const [xAxisLabel, setXAxisLabel] = useState(propConfig?.xAxisLabel || '');
  const [yAxisLabel, setYAxisLabel] = useState(propConfig?.yAxisLabel || '');
  const [showLegend, setShowLegend] = useState(propConfig?.showLegend !== false);
  const [showGrid, setShowGrid] = useState(propConfig?.showGrid !== false);
  const [animations, setAnimations] = useState(propConfig?.animations !== false);
  const [dataPoints, setDataPoints] = useState<ChartDataPoint[]>(propData || [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
  ]);
  const colors = propConfig?.colors || defaultColors;
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');

  // Code editor state
  const [code, setCode] = useState(propCode || '');
  const [framework, setFramework] = useState(propFramework || 'recharts');
  const [detectedFramework, setDetectedFramework] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect framework from code
  const detectFramework = (code: string): 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom' | null => {
    if (!code.trim()) return null;

    // Chart.js detection
    if (/new\s+Chart\(|Chart\.register|chartjs|chart\.js/i.test(code)) {
      return 'chartjs';
    }

    // Recharts detection
    if (/<(BarChart|LineChart|AreaChart|PieChart|RadarChart|ScatterChart)[\s\S]*?>/i.test(code)) {
      return 'recharts';
    }

    // D3.js detection
    if (/d3\.(select|scale|svg|axis|brush|zoom)/i.test(code)) {
      return 'd3';
    }

    // Mermaid detection
    if (/(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/i.test(code)) {
      return 'mermaid';
    }

    // SVG detection (must be last as it's most generic)
    if (/<svg[\s\S]*?<\/svg>|<svg[\s\S]*?\/>/i.test(code)) {
      return 'svg';
    }

    return 'custom';
  };

  // Update parent when visual editor values change
  useEffect(() => {
    if (editorMode === 'visual') {
      onChange(undefined, undefined, chartType, dataPoints, {
        title,
        xAxisLabel,
        yAxisLabel,
        colors,
        showLegend,
        showGrid,
        animations
      });
    }
  }, [editorMode, chartType, dataPoints, title, xAxisLabel, yAxisLabel, colors, showLegend, showGrid, animations]);

  // Sync JSON input with dataPoints
  useEffect(() => {
    if (activeTab === 'json' && editorMode === 'visual') {
      setJsonInput(JSON.stringify(dataPoints, null, 2));
    }
  }, [activeTab, dataPoints, editorMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && editorMode === 'code') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(300, textareaRef.current.scrollHeight) + 'px';
    }
  }, [code, editorMode]);

  // Detect framework when code changes
  useEffect(() => {
    if (code && editorMode === 'code') {
      const detected = detectFramework(code);
      setDetectedFramework(detected);
      if (detected && detected !== 'custom' && detected !== null) {
        setFramework(detected);
      }
    }
  }, [code, editorMode]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsTyping(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the onChange call
    timeoutRef.current = setTimeout(() => {
      const detected = detectFramework(newCode);
      onChange(detected || framework, newCode);
      setIsTyping(false);
    }, 300);
  };

  const handleAddDataPoint = () => {
    setDataPoints([...dataPoints, { name: `Item ${dataPoints.length + 1}`, value: 0 }]);
  };

  const handleRemoveDataPoint = (index: number) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  };

  const handleDataPointChange = (index: number, field: string, value: string | number) => {
    const updated = [...dataPoints];
    updated[index] = { ...updated[index], [field]: value };
    setDataPoints(updated);
  };

  const handleJsonSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        setDataPoints(parsed as ChartDataPoint[]);
        setJsonError('');
      } else {
        setJsonError('Data must be an array of objects');
      }
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCode = () => {
    const extension = framework === 'mermaid' ? 'mmd' : framework === 'svg' ? 'svg' : 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chart.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleCodeChange(content);
      };
      reader.readAsText(file);
    }
  };

  const formatCode = () => {
    // Basic code formatting
    let formatted = code.trim();

    if (framework === 'svg' || detectedFramework === 'svg') {
      // Format XML/SVG
      formatted = formatted.replace(/>\s*</g, '>\n<');
      let indent = 0;
      const lines = formatted.split('\n');
      formatted = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.match(/^<\//)) {
          indent = Math.max(0, indent - 1);
        }
        const indented = '  '.repeat(indent) + trimmed;
        if (trimmed.match(/^<[^/][^>]*[^/]>$/)) {
          indent++;
        }
        return indented;
      }).join('\n');
    }

    setCode(formatted);
    handleCodeChange(formatted);
  };

  const chartTypes: { value: 'bar' | 'line' | 'area' | 'pie' | 'radar'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
  ];

  const templates = {
    recharts: `<BarChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="value" fill="#3b82f6" />
</BarChart>`,
    chartjs: `new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [12, 19, 3, 5, 2],
      backgroundColor: '#3b82f6'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  }
});`,
    d3: `const svg = d3.select("#chart")
  .append("svg")
  .attr("width", 600)
  .attr("height", 400);

const data = [30, 86, 168, 281, 303, 365];

svg.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", (d, i) => i * 70)
  .attr("y", d => 400 - d)
  .attr("width", 65)
  .attr("height", d => d)
  .attr("fill", "#3b82f6");`,
    svg: `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="600" height="400" fill="#f3f4f6"/>
  <circle cx="300" cy="200" r="100" fill="#3b82f6" />
  <text x="300" y="210" text-anchor="middle" fill="white" font-size="20">
    SVG Chart
  </text>
</svg>`,
    mermaid: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`
  };

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-300 ${className}`}>
      <div className="p-6 space-y-6">
        {/* Mode Selector: Visual vs Code */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Chart Block Editor</h3>
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-300">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                editorMode === 'visual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Visual Editor
            </button>
            <button
              onClick={() => setEditorMode('code')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                editorMode === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Code Editor
            </button>
          </div>
        </div>

        {/* Visual Editor Mode */}
        {editorMode === 'visual' && (
          <>
            {/* Chart Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Chart Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {chartTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setChartType(type.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        chartType === type.value
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 hover:border-gray-400 bg-white text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chart Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Chart Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chart title"
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {chartType !== 'pie' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">X-Axis Label</label>
                    <input
                      type="text"
                      value={xAxisLabel}
                      onChange={(e) => setXAxisLabel(e.target.value)}
                      placeholder="e.g., Months"
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Y-Axis Label</label>
                    <input
                      type="text"
                      value={yAxisLabel}
                      onChange={(e) => setYAxisLabel(e.target.value)}
                      placeholder="e.g., Revenue"
                      className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Chart Options */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">Display Options</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLegend}
                    onChange={(e) => setShowLegend(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">Show Legend</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">Show Grid</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={animations}
                    onChange={(e) => setAnimations(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">Enable Animations</span>
                </label>
              </div>
            </div>

            {/* Data Input Tabs */}
            <div>
              <div className="flex gap-2 mb-4 border-b border-gray-300">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'visual'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Visual Editor
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    activeTab === 'json'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  JSON Editor
                </button>
              </div>

              {activeTab === 'visual' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-900">Data Points</label>
                    <button
                      onClick={handleAddDataPoint}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Point
                    </button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {dataPoints.map((point, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 bg-white rounded-lg border border-gray-300">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={point.name || ''}
                            onChange={(e) => handleDataPointChange(index, 'name', e.target.value)}
                            placeholder="Label"
                            className="w-full px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            value={point.value || 0}
                            onChange={(e) => handleDataPointChange(index, 'value', parseFloat(e.target.value) || 0)}
                            placeholder="Value"
                            className="w-full px-2 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveDataPoint(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove data point"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      JSON Data (Array of objects with &quot;name&quot; and &quot;value&quot; fields)
                    </label>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 font-mono text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder='[{"name": "Item 1", "value": 100}, ...]'
                    />
                  </div>
                  {jsonError && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200">
                      {jsonError}
                    </div>
                  )}
                  <button
                    onClick={handleJsonSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply JSON
                  </button>
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Use the Visual Editor for quick changes or switch to Code Editor for advanced chart types (Chart.js, D3.js, SVG, Mermaid diagrams).
              </p>
            </div>
          </>
        )}

        {/* Code Editor Mode */}
        {editorMode === 'code' && (
          <>
            {/* Header with View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-950">Framework:</label>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom')}
                  className="px-3 py-1.5 text-sm text-gray-900 font-medium border-2 border-gray-400 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recharts">Recharts</option>
                  <option value="chartjs">Chart.js</option>
                  <option value="d3">D3.js</option>
                  <option value="svg">SVG</option>
                  <option value="mermaid">Mermaid</option>
                  <option value="custom">Custom</option>
                </select>
                {detectedFramework && detectedFramework !== framework && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded border border-yellow-300">
                    Detected: {detectedFramework}
                  </span>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-300">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'editor'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Editor
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    viewMode === 'preview'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'split'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Split
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-400 rounded-lg hover:bg-gray-100 hover:border-gray-500 transition-colors"
                >
                  Templates
                </button>
                <button
                  onClick={formatCode}
                  className="p-1.5 text-gray-800 bg-gray-50 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-gray-300 hover:border-purple-300"
                  title="Format/Beautify Code"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`p-1.5 rounded-lg transition-colors border ${
                    copied
                      ? 'text-green-700 bg-green-50 border-green-300'
                      : 'text-gray-800 bg-gray-50 hover:text-gray-900 hover:bg-gray-200 border-gray-300 hover:border-gray-400'
                  }`}
                  title={copied ? "Copied!" : "Copy Code"}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={exportCode}
                  className="p-1.5 text-gray-800 bg-gray-50 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
                  title="Export Code"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-800 bg-gray-50 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 hover:border-gray-400"
                  title="Import Code"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.svg,.mmd,.js,.jsx"
                  onChange={importCode}
                  className="hidden"
                />
              </div>
            </div>

            {/* Templates Panel */}
            {showTemplates && (
              <div className="border-2 border-gray-200 rounded-lg bg-white shadow-sm">
                <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h4 className="text-sm font-semibold text-gray-900">📊 Chart Templates</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Click to insert a template</p>
                </div>
                <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                  {Object.entries(templates).map(([key, template]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setCode(template);
                        handleCodeChange(template);
                        setShowTemplates(false);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 capitalize">
                        {key} Template
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 group-hover:text-blue-600">
                        Basic {key} chart example
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Editor Content */}
            {viewMode === 'editor' && (
              <div className="space-y-4">
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder={`// Paste your ${framework} chart code here...\n// Supports Chart.js, Recharts, D3.js, SVG, Mermaid diagrams`}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none font-mono text-sm leading-6"
                  style={{ minHeight: '400px', tabSize: 2 }}
                />
              </div>
            )}

            {viewMode === 'preview' && (
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-white min-h-[400px]">
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</span>
                  <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {framework}
                  </span>
                </div>
                <div className="flex items-center justify-center text-gray-500 text-sm">
                  <p>Preview will be available on the published page</p>
                </div>
              </div>
            )}

            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    Code Editor
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder={`// Paste your ${framework} code here...`}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none font-mono text-sm leading-6"
                    style={{ height: '400px', tabSize: 2 }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                    Live Preview
                  </label>
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-white h-[400px] overflow-auto">
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      <p>Preview will be available on the published page</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-900 font-semibold">
                <span className="text-gray-800 font-medium">Characters:</span> {code.length} <span className="text-gray-500">•</span> <span className="text-gray-800 font-medium">Lines:</span> {code.split('\n').length}
                {code.length > 10000 && (
                  <span className="text-amber-700 ml-2 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    ⚠️ Large code blocks may impact performance
                  </span>
                )}
              </div>
              {isTyping && (
                <div className="text-sm text-blue-600 font-medium flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Saving...
                </div>
              )}
            </div>

            {/* Info Note */}
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm text-blue-950 font-medium">
                <strong className="font-semibold">Supported Frameworks:</strong> Chart.js, Recharts, D3.js, SVG, Mermaid diagrams. Just paste your code and it will be detected automatically!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
