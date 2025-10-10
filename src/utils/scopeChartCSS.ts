/**
 * CSS Scoping Utility for Multi-Part Charts
 *
 * Prevents chart CSS from leaking out and affecting the global page styles.
 * Automatically prefixes all CSS selectors with a unique container class.
 */

/**
 * Scope CSS to a specific container by prefixing all selectors
 *
 * @param css - Raw CSS text from user input
 * @param scopeClass - Unique class to scope CSS to (e.g., 'multipart-chart-scope-abc123')
 * @returns Scoped CSS that only applies within the container
 */
export function scopeChartCSS(css: string, scopeClass: string): string {
  if (!css || !scopeClass) return css;

  // Remove comments to simplify parsing
  let processedCSS = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Process @keyframes separately (don't scope keyframe names)
  const keyframes: string[] = [];
  processedCSS = processedCSS.replace(
    /@(?:-webkit-|-moz-|-o-)?keyframes\s+([^\s{]+)\s*{([\s\S]+?})\s*}/gi,
    (match, name, content) => {
      keyframes.push(match);
      return `__KEYFRAME_${keyframes.length - 1}__`;
    }
  );

  // Process @font-face separately (don't scope)
  const fontFaces: string[] = [];
  processedCSS = processedCSS.replace(
    /@font-face\s*{([^}]+)}/gi,
    (match) => {
      fontFaces.push(match);
      return `__FONTFACE_${fontFaces.length - 1}__`;
    }
  );

  // Process @media queries (scope rules inside)
  processedCSS = processedCSS.replace(
    /@media\s*([^{]+)\s*{([\s\S]+?)}\s*}/gi,
    (match, condition, content) => {
      const scopedContent = scopeRules(content, scopeClass);
      return `@media ${condition} {\n${scopedContent}\n}`;
    }
  );

  // Process @supports queries (scope rules inside)
  processedCSS = processedCSS.replace(
    /@supports\s*([^{]+)\s*{([\s\S]+?)}\s*}/gi,
    (match, condition, content) => {
      const scopedContent = scopeRules(content, scopeClass);
      return `@supports ${condition} {\n${scopedContent}\n}`;
    }
  );

  // Scope remaining CSS rules
  processedCSS = scopeRules(processedCSS, scopeClass);

  // Restore keyframes
  keyframes.forEach((keyframe, index) => {
    processedCSS = processedCSS.replace(`__KEYFRAME_${index}__`, keyframe);
  });

  // Restore font-faces
  fontFaces.forEach((fontFace, index) => {
    processedCSS = processedCSS.replace(`__FONTFACE_${index}__`, fontFace);
  });

  return processedCSS;
}

/**
 * Scope individual CSS rules
 */
function scopeRules(css: string, scopeClass: string): string {
  // Match CSS rules: selector { properties }
  return css.replace(
    /([^{}]+)\s*{([^{}]*)}/g,
    (match, selectors, properties) => {
      // Skip if this is a nested rule or incomplete
      if (!selectors || !properties) return match;

      // Split multiple selectors (e.g., "h1, h2, h3")
      const selectorList = selectors.split(',').map((s: string) => s.trim());

      // Scope each selector
      const scopedSelectors = selectorList.map((selector: string) => {
        return scopeSelector(selector, scopeClass);
      });

      return `${scopedSelectors.join(',\n')} {${properties}}`;
    }
  );
}

/**
 * Scope a single CSS selector
 */
function scopeSelector(selector: string, scopeClass: string): string {
  selector = selector.trim();
  if (!selector) return selector;

  // Handle global selectors by replacing them with the container
  // body -> .scope-class
  // html -> .scope-class
  // :root -> .scope-class
  if (/^(body|html|:root)(\s|$|::|:)/i.test(selector)) {
    return selector.replace(/^(body|html|:root)/i, `.${scopeClass}`);
  }

  // Handle universal selector (*)
  // * -> .scope-class *
  // *, div -> .scope-class *, .scope-class div
  if (selector === '*') {
    return `.${scopeClass} *`;
  }

  // Handle selectors starting with universal selector
  // * + div -> .scope-class * + div
  if (selector.startsWith('*')) {
    return `.${scopeClass} ${selector}`;
  }

  // Handle @keyframes and @font-face (shouldn't reach here but just in case)
  if (selector.startsWith('@')) {
    return selector;
  }

  // Handle pseudo-elements that should be at the end
  // Preserve ::before, ::after, ::first-line, etc.
  const pseudoElementMatch = selector.match(/::(before|after|first-line|first-letter|selection|placeholder|backdrop|marker|cue|slotted)/);

  if (pseudoElementMatch) {
    // Split on the pseudo-element and scope the base selector
    const parts = selector.split('::');
    const baseSelector = parts[0].trim();
    const pseudoElement = '::' + parts.slice(1).join('::');

    if (!baseSelector || baseSelector === '') {
      // ::before without base selector -> .scope-class::before
      return `.${scopeClass}${pseudoElement}`;
    }

    // div::before -> .scope-class div::before
    return `.${scopeClass} ${baseSelector}${pseudoElement}`;
  }

  // Regular selectors: prefix with scope class
  // div -> .scope-class div
  // .my-class -> .scope-class .my-class
  // #my-id -> .scope-class #my-id
  // div > span -> .scope-class div > span
  return `.${scopeClass} ${selector}`;
}

/**
 * Generate a unique scope class for a chart instance
 */
export function generateScopeClass(): string {
  return `multipart-chart-scope-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Test if CSS contains potentially dangerous global selectors
 * @returns Array of warnings (empty if safe)
 */
export function detectUnsafeCSS(css: string): string[] {
  const warnings: string[] = [];

  if (/\bhtml\s*{/.test(css)) {
    warnings.push('CSS contains "html" selector which affects the entire page');
  }

  if (/\bbody\s*{/.test(css)) {
    warnings.push('CSS contains "body" selector which affects the entire page');
  }

  if (/^\s*\*\s*{/m.test(css)) {
    warnings.push('CSS contains universal selector "*" which affects all elements');
  }

  if (/position\s*:\s*(fixed|sticky)/i.test(css)) {
    warnings.push('CSS contains fixed/sticky positioning which may break page layout');
  }

  if (/z-index\s*:\s*9{3,}/i.test(css)) {
    warnings.push('CSS contains very high z-index values (999+) which may overlay page elements');
  }

  return warnings;
}
