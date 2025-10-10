/**
 * ID Scoping Utility for Multi-Part Charts
 * Prevents ID collisions when multiple charts exist on the same page
 * Automatically makes all IDs unique by appending a scope suffix
 */

export interface IDMapping {
  [originalId: string]: string; // originalId -> uniqueId
}

/**
 * Extract all IDs from HTML and create unique versions
 * @param html - Sanitized HTML string
 * @param scopeSuffix - Unique suffix to append to IDs (e.g., scope class)
 * @returns Mapping of original IDs to unique IDs
 */
export function extractAndMapIDs(html: string, scopeSuffix: string): IDMapping {
  const idMapping: IDMapping = {};

  // Match all id="..." attributes
  const idRegex = /\bid\s*=\s*["']([^"']+)["']/gi;
  let match;

  while ((match = idRegex.exec(html)) !== null) {
    const originalId = match[1];
    // Create unique ID by appending scope suffix
    const uniqueId = `${originalId}-${scopeSuffix}`;
    idMapping[originalId] = uniqueId;
  }

  return idMapping;
}

/**
 * Replace all IDs in HTML with unique versions
 * @param html - Sanitized HTML string
 * @param idMapping - Mapping of original IDs to unique IDs
 * @returns HTML with unique IDs
 */
export function replaceHTMLIDs(html: string, idMapping: IDMapping): string {
  let scopedHTML = html;

  // Replace each id="..." with unique version
  for (const [originalId, uniqueId] of Object.entries(idMapping)) {
    // Match id="originalId" (with single or double quotes)
    const idPattern = new RegExp(
      `\\bid\\s*=\\s*["']${escapeRegExp(originalId)}["']`,
      'gi'
    );
    scopedHTML = scopedHTML.replace(idPattern, `id="${uniqueId}"`);
  }

  return scopedHTML;
}

/**
 * Replace all ID references in JavaScript code with unique versions
 * Handles: getElementById, querySelector('#id'), querySelectorAll('#id')
 * @param javascript - User's JavaScript code
 * @param idMapping - Mapping of original IDs to unique IDs
 * @returns JavaScript with updated ID references
 */
export function replaceJavaScriptIDs(javascript: string, idMapping: IDMapping): string {
  let scopedJS = javascript;

  for (const [originalId, uniqueId] of Object.entries(idMapping)) {
    // 1. Replace getElementById('originalId') or getElementById("originalId")
    const getByIdPattern = new RegExp(
      `getElementById\\s*\\(\\s*["']${escapeRegExp(originalId)}["']\\s*\\)`,
      'g'
    );
    scopedJS = scopedJS.replace(getByIdPattern, `getElementById("${uniqueId}")`);

    // 2. Replace querySelector('#originalId') or querySelector("#originalId")
    const querySelectorPattern = new RegExp(
      `querySelector\\s*\\(\\s*["']#${escapeRegExp(originalId)}["']\\s*\\)`,
      'g'
    );
    scopedJS = scopedJS.replace(querySelectorPattern, `querySelector("#${uniqueId}")`);

    // 3. Replace querySelectorAll('#originalId')
    const querySelectorAllPattern = new RegExp(
      `querySelectorAll\\s*\\(\\s*["']#${escapeRegExp(originalId)}["']\\s*\\)`,
      'g'
    );
    scopedJS = scopedJS.replace(querySelectorAllPattern, `querySelectorAll("#${uniqueId}")`);

    // 4. Replace direct string references like '#originalId' in variables
    // Be careful not to replace in comments or unrelated strings
    const directRefPattern = new RegExp(
      `["']#${escapeRegExp(originalId)}["']`,
      'g'
    );
    scopedJS = scopedJS.replace(directRefPattern, `"#${uniqueId}"`);
  }

  return scopedJS;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Main function: Scope both HTML and JavaScript IDs
 * @param html - Sanitized HTML string
 * @param javascript - User's JavaScript code
 * @param scopeSuffix - Unique suffix (e.g., scope class name)
 * @returns Object with scoped HTML and JavaScript
 */
export function scopeChartIDs(
  html: string,
  javascript: string,
  scopeSuffix: string
): { html: string; javascript: string; idMapping: IDMapping } {
  // Extract all IDs from HTML
  const idMapping = extractAndMapIDs(html, scopeSuffix);

  // If no IDs found, return original
  if (Object.keys(idMapping).length === 0) {
    return { html, javascript, idMapping: {} };
  }

  // Replace IDs in HTML
  const scopedHTML = replaceHTMLIDs(html, idMapping);

  // Replace ID references in JavaScript
  const scopedJS = replaceJavaScriptIDs(javascript, idMapping);

  console.log('[scopeChartIDs] ID mapping:', idMapping);

  return {
    html: scopedHTML,
    javascript: scopedJS,
    idMapping
  };
}
