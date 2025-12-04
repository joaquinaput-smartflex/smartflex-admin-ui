/**
 * Client-side API utilities.
 * Handles basePath for API calls from the browser.
 */

// Get basePath from Next.js config (available at build time via NEXT_PUBLIC_)
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/admin';

/**
 * Build an API URL with the correct basePath.
 * Use this for all client-side fetch() calls.
 */
export function apiUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}

/**
 * Client-side fetch wrapper that automatically adds basePath.
 */
export async function clientFetch(
  path: string,
  options?: RequestInit
): Promise<Response> {
  return fetch(apiUrl(path), options);
}
