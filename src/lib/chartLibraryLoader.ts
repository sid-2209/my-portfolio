/**
 * Chart Library Loader
 * Dynamically loads external chart libraries (Chart.js, D3.js, Mermaid) via CDN
 * Provides promise-based loading with caching and error handling
 */

export type SupportedLibrary = 'chartjs' | 'd3' | 'mermaid';

export interface LibraryConfig {
  name: string;
  globalName: string; // Global variable name when loaded
  cdnUrl: string;
  version: string;
  integrity?: string; // SRI hash for security
}

// Library registry with CDN URLs
export const LIBRARY_REGISTRY: Record<SupportedLibrary, LibraryConfig> = {
  chartjs: {
    name: 'Chart.js',
    globalName: 'Chart',
    version: '4.4.0',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
  },
  d3: {
    name: 'D3.js',
    globalName: 'd3',
    version: '7.8.5',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js'
  },
  mermaid: {
    name: 'Mermaid',
    globalName: 'mermaid',
    version: '10.6.1',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js'
  }
};

// Cache to track loaded libraries
const loadedLibraries = new Set<SupportedLibrary>();
const loadingPromises = new Map<SupportedLibrary, Promise<void>>();

/**
 * Load a chart library dynamically via CDN
 * @param library - The library identifier
 * @param timeout - Maximum time to wait for library to load (ms)
 * @returns Promise that resolves when library is loaded
 */
export async function loadLibrary(
  library: SupportedLibrary,
  timeout = 10000
): Promise<void> {
  const config = LIBRARY_REGISTRY[library];

  // Return immediately if already loaded
  if (loadedLibraries.has(library)) {
    return Promise.resolve();
  }

  // Return existing loading promise if currently loading
  if (loadingPromises.has(library)) {
    return loadingPromises.get(library)!;
  }

  // Create new loading promise
  const loadingPromise = new Promise<void>((resolve, reject) => {
    // Check if library is already available globally (loaded by another component)
    if (typeof window !== 'undefined' && config.globalName in window && (window as unknown as Record<string, unknown>)[config.globalName]) {
      loadedLibraries.add(library);
      resolve();
      return;
    }

    // Create script element
    console.log(`[LibraryLoader] Loading ${config.name} from ${config.cdnUrl}`);
    const script = document.createElement('script');
    script.src = config.cdnUrl;
    script.async = true;
    script.crossOrigin = 'anonymous';

    // Add SRI integrity check for security (if available)
    if (config.integrity) {
      script.integrity = config.integrity;
    }

    // Set up timeout
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout loading ${config.name} after ${timeout}ms`));
    }, timeout);

    // Success handler
    const onLoad = () => {
      clearTimeout(timeoutId);
      cleanup();

      // Verify library is actually available
      if (!(config.globalName in window) || typeof (window as unknown as Record<string, unknown>)[config.globalName] === 'undefined') {
        console.error(`[LibraryLoader] ${config.name} loaded but global ${config.globalName} not found`);
        reject(new Error(`${config.name} loaded but global ${config.globalName} not found`));
        return;
      }

      console.log(`[LibraryLoader] Successfully loaded ${config.name} v${config.version}`);
      loadedLibraries.add(library);
      resolve();
    };

    // Error handler
    const onError = (event: Event | string) => {
      clearTimeout(timeoutId);
      cleanup();
      console.error(`[LibraryLoader] Failed to load ${config.name} from ${config.cdnUrl}`, event);
      reject(new Error(`Failed to load ${config.name} from CDN. The CDN may be blocked or unavailable.`));
    };

    // Cleanup function
    const cleanup = () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      loadingPromises.delete(library);
    };

    // Attach event listeners
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);

    // Inject script into document
    document.head.appendChild(script);
  });

  loadingPromises.set(library, loadingPromise);
  return loadingPromise;
}

/**
 * Load multiple libraries concurrently
 * @param libraries - Array of library identifiers
 * @returns Promise that resolves when all libraries are loaded
 */
export async function loadLibraries(
  libraries: SupportedLibrary[]
): Promise<void> {
  const uniqueLibraries = Array.from(new Set(libraries));
  await Promise.all(uniqueLibraries.map(lib => loadLibrary(lib)));
}

/**
 * Check if a library is currently loaded
 * @param library - The library identifier
 * @returns true if library is loaded and available
 */
export function isLibraryLoaded(library: SupportedLibrary): boolean {
  const config = LIBRARY_REGISTRY[library];
  return (
    loadedLibraries.has(library) &&
    typeof window !== 'undefined' &&
    config.globalName in window &&
    typeof (window as unknown as Record<string, unknown>)[config.globalName] !== 'undefined'
  );
}

/**
 * Get the global object for a loaded library
 * @param library - The library identifier
 * @returns The global library object or undefined if not loaded
 */
export function getLibraryGlobal(library: SupportedLibrary): unknown {
  if (!isLibraryLoaded(library)) {
    return undefined;
  }
  const config = LIBRARY_REGISTRY[library];
  return (window as unknown as Record<string, unknown>)[config.globalName];
}

/**
 * Unload a library (removes from cache, but doesn't remove script tag)
 * Useful for testing or forcing reload
 * @param library - The library identifier
 */
export function unloadLibrary(library: SupportedLibrary): void {
  loadedLibraries.delete(library);
  loadingPromises.delete(library);
}

/**
 * Clear all loaded libraries from cache
 */
export function clearLibraryCache(): void {
  loadedLibraries.clear();
  loadingPromises.clear();
}
