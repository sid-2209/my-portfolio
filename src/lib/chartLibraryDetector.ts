/**
 * Chart Library Detector
 * Analyzes code to detect which chart libraries are being used
 * Extracts CDN links and maps them to library identifiers
 */

import { SupportedLibrary, LIBRARY_REGISTRY } from './chartLibraryLoader';

export interface DetectedLibrary {
  library: SupportedLibrary;
  confidence: number; // 0-1, how confident we are in the detection
  patterns: string[]; // Which patterns matched
  version?: string; // Detected version if available
  cdnUrl?: string; // CDN URL if found in code
}

export interface CodeAnalysis {
  detectedLibraries: DetectedLibrary[];
  cdnScripts: Array<{ url: string; library?: SupportedLibrary }>;
  hasMultipleParts: boolean; // Has <style> or <script> tags
  framework: 'chartjs' | 'recharts' | 'd3' | 'svg' | 'mermaid' | 'custom' | 'multipart' | null;
}

/**
 * Detect Chart.js usage in code
 */
function detectChartJS(code: string): DetectedLibrary | null {
  const patterns: string[] = [];
  let confidence = 0;

  // Strong indicators (high confidence)
  if (/new\s+Chart\s*\(/.test(code)) {
    patterns.push('new Chart()');
    confidence += 0.4;
  }
  if (/Chart\.register/.test(code)) {
    patterns.push('Chart.register');
    confidence += 0.3;
  }
  if (/Chart\.defaults/.test(code)) {
    patterns.push('Chart.defaults');
    confidence += 0.3;
  }

  // Medium indicators
  if (/getContext\s*\(\s*['"]2d['"]\s*\)/.test(code)) {
    patterns.push('canvas 2d context');
    confidence += 0.2;
  }
  if (/(bar|line|pie|doughnut|radar|polarArea)Chart/i.test(code)) {
    patterns.push('Chart type reference');
    confidence += 0.2;
  }

  // Weak indicators (mentions in comments/strings)
  if (/chartjs|chart\.js/i.test(code)) {
    patterns.push('chartjs mention');
    confidence += 0.1;
  }

  // Extract version from CDN if present
  const versionMatch = code.match(/chart(?:\.js)?[/@](\d+\.\d+\.\d+)/i);
  const version = versionMatch ? versionMatch[1] : undefined;

  return confidence > 0.3 ? {
    library: 'chartjs',
    confidence: Math.min(confidence, 1),
    patterns,
    version
  } : null;
}

/**
 * Detect D3.js usage in code
 */
function detectD3(code: string): DetectedLibrary | null {
  const patterns: string[] = [];
  let confidence = 0;

  // Strong indicators
  if (/d3\.(select|selectAll)\s*\(/.test(code)) {
    patterns.push('d3.select/selectAll');
    confidence += 0.4;
  }
  if (/d3\.(scale|svg|axis|brush|zoom|drag|force|layout|geo|time|format)/i.test(code)) {
    patterns.push('d3 core methods');
    confidence += 0.4;
  }

  // Medium indicators
  if (/import.*d3/i.test(code) || /from\s+['"]d3['"]/i.test(code)) {
    patterns.push('d3 import statement');
    confidence += 0.3;
  }
  if (/d3-/.test(code)) {
    patterns.push('d3 module reference');
    confidence += 0.2;
  }

  // Weak indicators
  if (/\.attr\s*\(\s*['"][^'"]+['"]\s*,/.test(code) && /svg/i.test(code)) {
    patterns.push('attr() with SVG context');
    confidence += 0.1;
  }

  const versionMatch = code.match(/d3[/@](\d+\.\d+\.\d+)/i);
  const version = versionMatch ? versionMatch[1] : undefined;

  return confidence > 0.3 ? {
    library: 'd3',
    confidence: Math.min(confidence, 1),
    patterns,
    version
  } : null;
}

/**
 * Detect Mermaid usage in code
 */
function detectMermaid(code: string): DetectedLibrary | null {
  const patterns: string[] = [];
  let confidence = 0;

  // Strong indicators - diagram syntax
  if (/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirement|c4)\s/im.test(code)) {
    patterns.push('mermaid diagram syntax');
    confidence += 0.5;
  }

  // Medium indicators - API usage
  if (/mermaid\.(init|initialize|render)/i.test(code)) {
    patterns.push('mermaid API calls');
    confidence += 0.4;
  }
  if (/```mermaid/i.test(code)) {
    patterns.push('markdown mermaid block');
    confidence += 0.3;
  }

  // Weak indicators
  if (/mermaid/i.test(code)) {
    patterns.push('mermaid mention');
    confidence += 0.1;
  }

  const versionMatch = code.match(/mermaid[/@](\d+\.\d+\.\d+)/i);
  const version = versionMatch ? versionMatch[1] : undefined;

  return confidence > 0.3 ? {
    library: 'mermaid',
    confidence: Math.min(confidence, 1),
    patterns,
    version
  } : null;
}

/**
 * Extract CDN script tags from HTML code
 */
export function extractCDNScripts(html: string): Array<{ url: string; library?: SupportedLibrary }> {
  const scripts: Array<{ url: string; library?: SupportedLibrary }> = [];

  // Match <script src="..."> tags
  const scriptRegex = /<script[^>]+src\s*=\s*['"]([^'"]+)['"]/gi;
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const url = match[1];

    // Skip non-CDN URLs (relative paths, etc.)
    if (!url.startsWith('http')) continue;

    // Map CDN URL to library
    let library: SupportedLibrary | undefined;
    const lowerUrl = url.toLowerCase();

    if (/chart(\.js)?/i.test(lowerUrl)) {
      library = 'chartjs';
    } else if (/\bd3\b/i.test(lowerUrl)) {
      library = 'd3';
    } else if (/mermaid/i.test(lowerUrl)) {
      library = 'mermaid';
    }

    scripts.push({ url, library });
  }

  return scripts;
}

/**
 * Detect which libraries are used in code (HTML + CSS + JavaScript)
 * Can detect multiple libraries simultaneously
 */
export function detectLibrariesInCode(
  html: string,
  css: string,
  javascript: string
): DetectedLibrary[] {
  const detected: DetectedLibrary[] = [];
  const combinedCode = `${html}\n${css}\n${javascript}`;

  // Detect Chart.js
  const chartjs = detectChartJS(combinedCode);
  if (chartjs) detected.push(chartjs);

  // Detect D3.js
  const d3 = detectD3(combinedCode);
  if (d3) detected.push(d3);

  // Detect Mermaid
  const mermaid = detectMermaid(combinedCode);
  if (mermaid) detected.push(mermaid);

  // Extract CDN URLs from HTML and update version info
  const cdnScripts = extractCDNScripts(html);
  cdnScripts.forEach(script => {
    if (!script.library) return;

    const existing = detected.find(d => d.library === script.library);
    if (existing && !existing.cdnUrl) {
      existing.cdnUrl = script.url;

      // Try to extract version from CDN URL if not already detected
      if (!existing.version) {
        const versionMatch = script.url.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          existing.version = versionMatch[1];
        }
      }
    }
  });

  // Sort by confidence (highest first)
  return detected.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Analyze full code to determine framework and detect multi-part structure
 */
export function analyzeCode(code: string): CodeAnalysis {
  const lowerCode = code.toLowerCase();

  // Check for multi-part structure (HTML with <style> and <script>)
  const hasStyleTag = /<style[^>]*>[\s\S]*?<\/style>/i.test(code);
  const hasScriptTag = /<script[^>]*>[\s\S]*?<\/script>/i.test(code);
  const hasMultipleParts = hasStyleTag || hasScriptTag;

  // Extract CDN scripts
  const cdnScripts = extractCDNScripts(code);

  // Detect libraries from full code
  const detectedLibraries = detectLibrariesInCode(code, '', '');

  // Determine primary framework
  let framework: CodeAnalysis['framework'] = null;

  // If multi-part and has libraries, it's multipart mode
  if (hasMultipleParts && detectedLibraries.length > 0) {
    framework = 'multipart';
  }
  // Otherwise detect specific framework
  else if (detectedLibraries.length > 0) {
    framework = detectedLibraries[0].library as 'chartjs' | 'd3' | 'mermaid';
  }
  // Check for Recharts (JSX components)
  else if (/<(BarChart|LineChart|AreaChart|PieChart|RadarChart)/i.test(code)) {
    framework = 'recharts';
  }
  // Check for SVG
  else if (/<svg[\s\S]*?<\/svg>/i.test(code) || /<svg[\s\S]*?\/>/i.test(code)) {
    framework = 'svg';
  }
  // Multi-part vanilla JS
  else if (hasMultipleParts) {
    framework = 'multipart';
  }
  // Custom/unknown
  else if (code.trim()) {
    framework = 'custom';
  }

  return {
    detectedLibraries,
    cdnScripts,
    hasMultipleParts,
    framework
  };
}

/**
 * Extract separate HTML, CSS, and JavaScript from a full HTML document
 * Also removes CDN script tags (they'll be loaded separately)
 */
export function extractCodeParts(fullHTML: string): {
  html: string;
  css: string;
  javascript: string;
  hasMultipleParts: boolean;
  cdnScripts: Array<{ url: string; library?: SupportedLibrary }>;
} {
  let extractedHTML = fullHTML;
  let extractedCSS = '';
  let extractedJS = '';

  // Extract CDN scripts first
  const cdnScripts = extractCDNScripts(fullHTML);

  // Extract <style> tags
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const styles: string[] = [];
  let match;
  while ((match = styleRegex.exec(fullHTML)) !== null) {
    styles.push(match[1].trim());
  }
  extractedCSS = styles.join('\n\n');

  // Extract <script> tags (both inline and CDN)
  const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
  const scripts: string[] = [];
  while ((match = scriptRegex.exec(fullHTML)) !== null) {
    scripts.push(match[1].trim());
  }
  extractedJS = scripts.join('\n\n');

  // Remove style, script tags, and CDN script tags from HTML
  extractedHTML = fullHTML
    .replace(styleRegex, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim();

  // Clean up extra whitespace
  extractedHTML = extractedHTML.replace(/\n\s*\n\s*\n/g, '\n\n');

  const hasMultipleParts = !!(extractedCSS || extractedJS || cdnScripts.length > 0);

  return {
    html: extractedHTML,
    css: extractedCSS,
    javascript: extractedJS,
    hasMultipleParts,
    cdnScripts
  };
}
