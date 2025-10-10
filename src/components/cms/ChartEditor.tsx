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
  framework?: 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom' | 'multipart';
  code?: string;

  // Multi-part fields
  html?: string;
  css?: string;
  javascript?: string;

  containerWidth?: 'text' | 'media' | 'full';

  // Legacy visual editor fields (backwards compatible)
  chartType?: 'bar' | 'line' | 'area' | 'pie' | 'radar';
  data?: ChartDataPoint[];
  config?: ChartConfig;

  onChange: (
    framework: 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom' | 'multipart' | undefined,
    code: string | undefined,
    chartType?: 'bar' | 'line' | 'area' | 'pie' | 'radar',
    data?: ChartDataPoint[],
    config?: ChartConfig,
    containerWidth?: 'text' | 'media' | 'full',
    html?: string,
    css?: string,
    javascript?: string
  ) => void;
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
  html: propHtml,
  css: propCss,
  javascript: propJavascript,
  chartType: propChartType,
  data: propData,
  config: propConfig,
  containerWidth: propContainerWidth,
  onChange,
  className = ""
}: ChartEditorProps) {
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'multipart'>(() => {
    if (propHtml || propCss || propJavascript) return 'multipart';
    if (propCode) return 'code';
    return 'visual';
  });
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
  const [containerWidth, setContainerWidth] = useState<'text' | 'media' | 'full'>(propContainerWidth || 'media');
  const [detectedFramework, setDetectedFramework] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMultiPartSuggestion, setShowMultiPartSuggestion] = useState(false);

  // Multi-part editor state
  const [htmlCode, setHtmlCode] = useState(propHtml || '');
  const [cssCode, setCssCode] = useState(propCss || '');
  const [jsCode, setJsCode] = useState(propJavascript || '');
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'css' | 'js'>('html');
  const [detectedLibraries, setDetectedLibraries] = useState<string[]>([]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect framework from code
  const detectFramework = (code: string): 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom' | null => {
    if (!code.trim()) return null;

    const lowerCode = code.toLowerCase();

    // Chart.js detection - more comprehensive patterns
    if (
      /new\s+Chart\(/.test(code) ||
      /Chart\.register/.test(code) ||
      /chartjs|chart\.js/.test(lowerCode) ||
      /Chart\.defaults/.test(code) ||
      /(bar|line|pie|doughnut|radar|polarArea)Chart/i.test(code) ||
      /getContext\s*\(\s*['"]2d['"]\s*\)/.test(code) // canvas 2d context often used with Chart.js
    ) {
      return 'chartjs';
    }

    // Recharts detection - JSX components
    if (
      /<(BarChart|LineChart|AreaChart|PieChart|RadarChart|ScatterChart|ComposedChart|Treemap|Funnel)[\s\S]*?>/i.test(code) ||
      /<(ResponsiveContainer|CartesianGrid|XAxis|YAxis|Tooltip|Legend)[\s\S]*?>/i.test(code) ||
      /recharts/i.test(lowerCode)
    ) {
      return 'recharts';
    }

    // D3.js detection - more patterns
    if (
      /d3\.(select|selectAll|scale|svg|axis|brush|zoom|drag|force|layout|geo|time|format|transition|ease)/i.test(code) ||
      /import.*d3/i.test(code) ||
      /from\s+['"]d3['"]/i.test(code) ||
      /d3-/.test(lowerCode) // d3 modules like d3-scale, d3-array, etc.
    ) {
      return 'd3';
    }

    // Mermaid detection - diagram types
    if (
      /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirement|c4)\s/im.test(code) ||
      /mermaid/i.test(lowerCode) ||
      /```mermaid/i.test(code)
    ) {
      return 'mermaid';
    }

    // SVG detection (must be after D3 as D3 often generates SVG)
    if (
      /<svg[\s\S]*?<\/svg>/i.test(code) ||
      /<svg[\s\S]*?\/>/i.test(code) ||
      (/xmlns\s*=\s*['"]http:\/\/www\.w3\.org\/2000\/svg['"]/.test(code) && !(/d3\./i.test(code)))
    ) {
      return 'svg';
    }

    // If nothing matches, it's custom code
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
      }, containerWidth);
    }
  }, [editorMode, chartType, dataPoints, title, xAxisLabel, yAxisLabel, colors, showLegend, showGrid, animations, containerWidth]);

  // Update parent when multi-part code changes
  useEffect(() => {
    if (editorMode === 'multipart') {
      onChange('multipart', undefined, undefined, undefined, undefined, containerWidth, htmlCode, cssCode, jsCode);
    }
  }, [editorMode, htmlCode, cssCode, jsCode, containerWidth]);

  // Detect library usage in multi-part code (now for positive indication)
  useEffect(() => {
    if (editorMode === 'multipart' && (htmlCode || cssCode || jsCode)) {
      const detected: string[] = [];

      // Detect Chart.js
      if (/new\s+Chart\(|Chart\.register|chartjs/i.test(jsCode)) {
        detected.push('Chart.js');
      }

      // Detect D3.js
      if (/d3\.(select|selectAll|scale|svg)/i.test(jsCode) || /import.*d3|from\s+['"]d3/i.test(jsCode)) {
        detected.push('D3.js');
      }

      // Detect Mermaid
      if (/mermaid\.init|mermaid\.render/i.test(jsCode)) {
        detected.push('Mermaid');
      }

      setDetectedLibraries(detected);
    } else {
      setDetectedLibraries([]);
    }
  }, [editorMode, htmlCode, cssCode, jsCode]);

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

  // Detect framework and multi-part structure when code changes
  useEffect(() => {
    if (code && editorMode === 'code') {
      const detected = detectFramework(code);
      setDetectedFramework(detected);
      if (detected && detected !== 'custom' && detected !== null) {
        setFramework(detected);
      }

      // Detect multi-part structure (HTML with <style> and <script>)
      const hasStyleTag = /<style[^>]*>[\s\S]*?<\/style>/i.test(code);
      const hasScriptTag = /<script[^>]*>[\s\S]*?<\/script>/i.test(code);

      if (hasStyleTag || hasScriptTag) {
        setShowMultiPartSuggestion(true);
      } else {
        setShowMultiPartSuggestion(false);
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
      onChange(detected || framework, newCode, undefined, undefined, undefined, containerWidth);
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

  // Extract code parts from full HTML document with enhanced CDN detection
  const extractCodeParts = (fullHTML: string): { html: string; css: string; javascript: string; hasMultipleParts: boolean } => {
    let extractedHTML = fullHTML;
    let extractedCSS = '';
    let extractedJS = '';

    // Extract <style> tags
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const styles: string[] = [];
    let match;
    while ((match = styleRegex.exec(fullHTML)) !== null) {
      styles.push(match[1].trim());
    }
    extractedCSS = styles.join('\n\n');

    // Extract inline <script> tags (not CDN scripts)
    // CDN scripts (with src attribute) will be ignored as libraries load automatically
    const inlineScriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
    const scripts: string[] = [];
    while ((match = inlineScriptRegex.exec(fullHTML)) !== null) {
      const scriptContent = match[1].trim();
      if (scriptContent) {
        scripts.push(scriptContent);
      }
    }
    extractedJS = scripts.join('\n\n');

    // Remove all style and script tags (including CDN scripts) from HTML
    extractedHTML = fullHTML
      .replace(styleRegex, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .trim();

    // Clean up extra whitespace
    extractedHTML = extractedHTML.replace(/\n\s*\n\s*\n/g, '\n\n');

    const hasMultipleParts = !!(extractedCSS || extractedJS);

    return {
      html: extractedHTML,
      css: extractedCSS,
      javascript: extractedJS,
      hasMultipleParts
    };
  };

  // Auto-extract and switch to multi-part mode
  const autoExtractToMultiPart = () => {
    const parts = extractCodeParts(code);
    setHtmlCode(parts.html);
    setCssCode(parts.css);
    setJsCode(parts.javascript);
    setEditorMode('multipart');
    setActiveCodeTab('html');
  };

  const chartTypes: { value: 'bar' | 'line' | 'area' | 'pie' | 'radar'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
  ];

  const templates = {
    recharts: `<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
    <XAxis dataKey="name" stroke="#fff" />
    <YAxis stroke="#fff" />
    <Tooltip
      contentStyle={{
        backgroundColor: 'rgba(0,0,0,0.8)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    />
    <Legend wrapperStyle={{ color: '#fff' }} />
    <Bar dataKey="value" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>`,
    chartjs: `new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b',
        '#ef4444', '#8b5cf6', '#ec4899'
      ],
      borderColor: '#1e40af',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#fff' }
      },
      title: {
        display: true,
        text: 'Revenue Chart',
        color: '#fff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  }
});`,
    d3: `// Modern D3.js v7+ bar chart with proper cleanup
const container = d3.select("#chart");
const width = 600;
const height = 400;
const margin = { top: 20, right: 30, bottom: 40, left: 50 };

const svg = container
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height]);

const data = [
  { name: 'A', value: 30 },
  { name: 'B', value: 86 },
  { name: 'C', value: 168 },
  { name: 'D', value: 281 },
  { name: 'E', value: 303 }
];

// Create scales
const x = d3.scaleBand()
  .domain(data.map(d => d.name))
  .range([margin.left, width - margin.right])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .nice()
  .range([height - margin.bottom, margin.top]);

// Add bars
svg.selectAll("rect")
  .data(data)
  .join("rect")
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value))
    .attr("width", x.bandwidth())
    .attr("fill", "#3b82f6");

// Add axes
svg.append("g")
  .attr("transform", \`translate(0,\${height - margin.bottom})\`)
  .call(d3.axisBottom(x))
  .attr("color", "#fff");

svg.append("g")
  .attr("transform", \`translate(\${margin.left},0)\`)
  .call(d3.axisLeft(y))
  .attr("color", "#fff");`,
    svg: `<svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="600" height="400" fill="#1e293b"/>

  <!-- Data visualization bars -->
  <rect x="50" y="280" width="80" height="100" fill="#3b82f6" rx="4"/>
  <rect x="150" y="200" width="80" height="180" fill="#10b981" rx="4"/>
  <rect x="250" y="120" width="80" height="260" fill="#f59e0b" rx="4"/>
  <rect x="350" y="160" width="80" height="220" fill="#ef4444" rx="4"/>
  <rect x="450" y="240" width="80" height="140" fill="#8b5cf6" rx="4"/>

  <!-- Labels -->
  <text x="90" y="395" text-anchor="middle" fill="#fff" font-size="14">Jan</text>
  <text x="190" y="395" text-anchor="middle" fill="#fff" font-size="14">Feb</text>
  <text x="290" y="395" text-anchor="middle" fill="#fff" font-size="14">Mar</text>
  <text x="390" y="395" text-anchor="middle" fill="#fff" font-size="14">Apr</text>
  <text x="490" y="395" text-anchor="middle" fill="#fff" font-size="14">May</text>

  <!-- Title -->
  <text x="300" y="30" text-anchor="middle" fill="#fff" font-size="20" font-weight="bold">
    Monthly Data
  </text>
</svg>`,
    mermaid: `graph LR
    A[Start] -->|Initialize| B[Process Data]
    B --> C{Valid?}
    C -->|Yes| D[Success]
    C -->|No| E[Error Handler]
    E --> F[Log Error]
    D --> G[End]
    F --> G

    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
    style E fill:#ef4444,stroke:#dc2626,color:#fff`
  };

  const multipartTemplates = {
    'interactive-bar': {
      html: `<div id="chart-container" class="chart-wrapper">
  <div class="chart-bar" data-value="30">Product A</div>
  <div class="chart-bar" data-value="60">Product B</div>
  <div class="chart-bar" data-value="45">Product C</div>
  <div class="chart-bar" data-value="80">Product D</div>
</div>`,
      css: `.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.chart-bar {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.chart-bar:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.chart-bar::after {
  content: attr(data-value) '%';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.9;
}`,
      javascript: `const bars = document.querySelectorAll('.chart-bar');

bars.forEach(bar => {
  const value = parseInt(bar.dataset.value);

  // Animate width on load
  bar.style.width = '0%';
  setTimeout(() => {
    bar.style.width = value + '%';
  }, 100);

  // Click handler
  bar.addEventListener('click', () => {
    const currentValue = bar.dataset.value;
    alert(\`\${bar.textContent.trim()}: \${currentValue}%\`);
  });
});`
    },
    'chartjs-bar': {
      html: `<div id="chart-wrapper" style="max-width: 600px; margin: 0 auto;">
  <canvas id="myChart"></canvas>
</div>`,
      css: `#chart-wrapper {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}`,
      javascript: `// Chart.js Bar Chart
const ctx = document.getElementById('myChart').getContext('2d');

const myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue ($)',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)'
      ],
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#fff', font: { size: 14 } }
      },
      title: {
        display: true,
        text: 'Revenue Chart 2024',
        color: '#fff',
        font: { size: 18, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: '#fff' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  }
});`
    },
    'd3-force-graph': {
      html: `<div id="graph-container">
  <svg id="force-graph" width="600" height="400"></svg>
</div>`,
      css: `#graph-container {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
  border-radius: 12px;
}

#force-graph {
  max-width: 100%;
  height: auto;
}

.node {
  cursor: pointer;
  transition: all 0.2s;
}

.node:hover {
  stroke: #fbbf24;
  stroke-width: 3;
}

.link {
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 1.5;
}`,
      javascript: `// D3.js Force-Directed Graph
const width = 600;
const height = 400;

const nodes = [
  { id: 'A', group: 1 },
  { id: 'B', group: 1 },
  { id: 'C', group: 2 },
  { id: 'D', group: 2 },
  { id: 'E', group: 3 }
];

const links = [
  { source: 'A', target: 'B' },
  { source: 'A', target: 'C' },
  { source: 'B', target: 'D' },
  { source: 'C', target: 'E' },
  { source: 'D', target: 'E' }
];

const svg = d3.select('#force-graph');

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(100))
  .force('charge', d3.forceManyBody().strength(-300))
  .force('center', d3.forceCenter(width / 2, height / 2));

const link = svg.append('g')
  .selectAll('line')
  .data(links)
  .join('line')
  .attr('class', 'link');

const node = svg.append('g')
  .selectAll('circle')
  .data(nodes)
  .join('circle')
  .attr('class', 'node')
  .attr('r', 20)
  .attr('fill', d => d3.schemeCategory10[d.group])
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended));

const label = svg.append('g')
  .selectAll('text')
  .data(nodes)
  .join('text')
  .text(d => d.id)
  .attr('font-size', 14)
  .attr('fill', '#fff')
  .attr('text-anchor', 'middle')
  .attr('dy', 5);

simulation.on('tick', () => {
  link
    .attr('x1', d => d.source.x)
    .attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x)
    .attr('y2', d => d.target.y);

  node
    .attr('cx', d => d.x)
    .attr('cy', d => d.y);

  label
    .attr('x', d => d.x)
    .attr('y', d => d.y);
});

function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}`
    },
    'mermaid-flowchart': {
      html: `<div id="diagram-container">
  <div id="mermaid-output"></div>
</div>`,
      css: `#diagram-container {
  padding: 30px;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#mermaid-output {
  background: white;
  padding: 20px;
  border-radius: 8px;
}`,
      javascript: `// Mermaid Flowchart
const diagramDefinition = \`
graph TD
    A[Start Process] -->|Initialize| B{Check Data}
    B -->|Valid| C[Process Data]
    B -->|Invalid| D[Show Error]
    C --> E{Success?}
    E -->|Yes| F[Save Results]
    E -->|No| G[Retry]
    G --> B
    F --> H[End]
    D --> H

    style A fill:#3b82f6,stroke:#1e40af,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
    style D fill:#ef4444,stroke:#dc2626,color:#fff
    style H fill:#6366f1,stroke:#4f46e5,color:#fff
\`;

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
});

mermaid.render('mermaid-diagram', diagramDefinition).then(({ svg }) => {
  document.getElementById('mermaid-output').innerHTML = svg;
});`
    },
    'custom-gauge': {
      html: `<div id="gauge-container">
  <div class="gauge">
    <div class="gauge-fill" id="gauge-fill"></div>
    <div class="gauge-cover">
      <span id="gauge-value">0%</span>
    </div>
  </div>
  <div class="gauge-controls">
    <button id="decrease">-</button>
    <button id="increase">+</button>
  </div>
</div>`,
      css: `#gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
}

.gauge {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-fill {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(#3b82f6 0deg, #60a5fa 180deg, #93c5fd 360deg);
  transition: clip-path 0.5s ease;
  clip-path: polygon(50% 50%, 50% 0%, 50% 0%, 50% 50%);
}

.gauge-cover {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

#gauge-value {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
}

.gauge-controls {
  display: flex;
  gap: 12px;
}

.gauge-controls button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #3b82f6;
  background: white;
  color: #3b82f6;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.gauge-controls button:hover {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}`,
      javascript: `let value = 0;
const gaugeFill = document.getElementById('gauge-fill');
const gaugeValue = document.getElementById('gauge-value');
const decreaseBtn = document.getElementById('decrease');
const increaseBtn = document.getElementById('increase');

function updateGauge(newValue) {
  value = Math.max(0, Math.min(100, newValue));
  const degrees = (value / 100) * 360;

  gaugeFill.style.clipPath = \`polygon(
    50% 50%,
    50% 0%,
    \${50 + 50 * Math.sin(degrees * Math.PI / 180)}% \${50 - 50 * Math.cos(degrees * Math.PI / 180)}%,
    50% 50%
  )\`;

  gaugeValue.textContent = value + '%';
}

decreaseBtn.addEventListener('click', () => updateGauge(value - 10));
increaseBtn.addEventListener('click', () => updateGauge(value + 10));

// Initialize
updateGauge(65);`
    }
  };

  const [showMultiPartTemplates, setShowMultiPartTemplates] = useState(false);

  const loadMultiPartTemplate = (templateName: keyof typeof multipartTemplates) => {
    const template = multipartTemplates[templateName];
    setHtmlCode(template.html);
    setCssCode(template.css);
    setJsCode(template.javascript);
    setShowMultiPartTemplates(false);
  };

  return (
    <div className={`bg-gray-50 rounded-lg border border-gray-300 ${className}`}>
      <div className="p-6 space-y-6">
        {/* Mode Selector: Visual vs Code vs Multi-Part */}
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
            <button
              onClick={() => setEditorMode('multipart')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                editorMode === 'multipart'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title="HTML + CSS + JavaScript"
            >
              Multi-Part
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
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
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

                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-950">Width:</label>
                  <select
                    value={containerWidth}
                    onChange={(e) => setContainerWidth(e.target.value as 'text' | 'media' | 'full')}
                    className="px-3 py-1.5 text-sm text-gray-900 font-medium border-2 border-gray-400 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Chart container width on the page"
                  >
                    <option value="text">Text Width (45%)</option>
                    <option value="media">Media Width (70%)</option>
                    <option value="full">Full Width (100%)</option>
                  </select>
                </div>
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

            {/* Multi-Part Suggestion Banner */}
            {showMultiPartSuggestion && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">💡</span>
                      <h4 className="text-sm font-semibold text-purple-900">Multi-Part Code Detected</h4>
                    </div>
                    <p className="text-sm text-purple-800">
                      We detected HTML with embedded <code className="bg-purple-200 px-1 rounded">&lt;style&gt;</code> and/or <code className="bg-purple-200 px-1 rounded">&lt;script&gt;</code> tags.
                      Would you like to extract them into separate tabs for easier editing?
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={autoExtractToMultiPart}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      Extract to Multi-Part
                    </button>
                    <button
                      onClick={() => setShowMultiPartSuggestion(false)}
                      className="px-3 py-2 text-purple-700 hover:bg-purple-100 rounded-lg transition-colors text-sm"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

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

        {/* Multi-Part Editor Mode */}
        {editorMode === 'multipart' && (
          <>
            {/* Header with Container Width */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">Multi-Part Chart Editor</span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded border border-purple-300">
                  HTML + CSS + JavaScript
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-950">Width:</label>
                <select
                  value={containerWidth}
                  onChange={(e) => setContainerWidth(e.target.value as 'text' | 'media' | 'full')}
                  className="px-3 py-1.5 text-sm text-gray-900 font-medium border-2 border-gray-400 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Chart container width on the page"
                >
                  <option value="text">Text Width (45%)</option>
                  <option value="media">Media Width (70%)</option>
                  <option value="full">Full Width (100%)</option>
                </select>
              </div>
            </div>

            {/* Multi-Part Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMultiPartTemplates(!showMultiPartTemplates)}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-900 bg-white border-2 border-purple-400 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-colors"
                >
                  🎨 Templates
                </button>
              </div>
            </div>

            {/* Library Detection Indicator */}
            {detectedLibraries.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">✅</span>
                      <h4 className="text-sm font-semibold text-green-900">
                        External Libraries Detected & Supported
                      </h4>
                    </div>
                    <p className="text-sm text-green-800 mb-2">
                      Multi-Part mode will automatically load: <strong>{detectedLibraries.join(', ')}</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      Libraries are loaded dynamically via CDN when your chart is rendered. No additional setup required!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-Part Templates Panel */}
            {showMultiPartTemplates && (
              <div className="border-2 border-purple-200 rounded-lg bg-white shadow-sm">
                <div className="p-3 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h4 className="text-sm font-semibold text-gray-900">🎨 Multi-Part Templates</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Click to load HTML + CSS + JavaScript</p>
                </div>
                <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                  {Object.keys(multipartTemplates).map((key) => (
                    <button
                      key={key}
                      onClick={() => loadMultiPartTemplate(key as keyof typeof multipartTemplates)}
                      className="w-full text-left p-3 rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                    >
                      <div className="font-semibold text-sm text-gray-900 group-hover:text-purple-700 capitalize">
                        {key.replace(/-/g, ' ')}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 group-hover:text-purple-600">
                        Interactive chart with animations
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Code Type Tabs */}
            <div className="border-b border-gray-300">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveCodeTab('html')}
                  className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-lg ${
                    activeCodeTab === 'html'
                      ? 'bg-blue-600 text-white border-2 border-blue-600 border-b-0'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setActiveCodeTab('css')}
                  className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-lg ${
                    activeCodeTab === 'css'
                      ? 'bg-blue-600 text-white border-2 border-blue-600 border-b-0'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  CSS
                </button>
                <button
                  onClick={() => setActiveCodeTab('js')}
                  className={`px-4 py-2 font-medium text-sm transition-colors rounded-t-lg ${
                    activeCodeTab === 'js'
                      ? 'bg-blue-600 text-white border-2 border-blue-600 border-b-0'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  JavaScript
                </button>
              </div>
            </div>

            {/* Code Editors */}
            <div className="space-y-4">
              {/* HTML Editor */}
              {activeCodeTab === 'html' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">HTML Structure</label>
                    <div className="text-xs text-gray-500">
                      {htmlCode.length} characters
                    </div>
                  </div>
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    placeholder={`<!-- Paste your HTML structure here -->
<div id="chart-container">
  <!-- Your chart markup -->
</div>`}
                    className="w-full h-96 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-y font-mono text-sm leading-6"
                    style={{ minHeight: '300px', tabSize: 2 }}
                  />
                </div>
              )}

              {/* CSS Editor */}
              {activeCodeTab === 'css' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">CSS Styles</label>
                    <div className="text-xs text-gray-500">
                      {cssCode.length} characters
                    </div>
                  </div>
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    placeholder={`/* Paste your CSS styles here */
#chart-container {
  /* Your styles */
}`}
                    className="w-full h-96 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-y font-mono text-sm leading-6"
                    style={{ minHeight: '300px', tabSize: 2 }}
                  />
                </div>
              )}

              {/* JavaScript Editor */}
              {activeCodeTab === 'js' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900">JavaScript Code</label>
                    <div className="text-xs text-gray-500">
                      {jsCode.length} characters
                    </div>
                  </div>
                  <textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    placeholder={`// Paste your JavaScript code here
const container = document.querySelector('#chart-container');
// Your interactive code`}
                    className="w-full h-96 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-y font-mono text-sm leading-6"
                    style={{ minHeight: '300px', tabSize: 2 }}
                  />
                </div>
              )}
            </div>

            {/* Info Notes */}
            <div className="space-y-3">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900 font-medium">
                  <strong className="font-semibold">Multi-Part Mode:</strong> Separate your HTML structure, CSS styles, and JavaScript logic into different tabs. They will be combined seamlessly when rendered on your post page.
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📚</span>
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Full Library Support</p>
                    <p className="mb-2">Multi-Part mode now supports both <strong>vanilla JavaScript</strong> and popular charting libraries:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li><strong>Chart.js</strong> - Canvas-based charts (bar, line, pie, etc.)</li>
                      <li><strong>D3.js</strong> - Data-driven visualizations</li>
                      <li><strong>Mermaid</strong> - Diagram and flowchart rendering</li>
                    </ul>
                    <p className="text-xs mt-2 font-medium">
                      Libraries are automatically detected and loaded from CDN when needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
