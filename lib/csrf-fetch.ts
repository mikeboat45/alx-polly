/**
 * CSRF-Protected Fetch Utility
 * 
 * This module provides a wrapper around the fetch API that automatically
 * includes CSRF tokens in requests to protect against CSRF attacks.
 */

import { CSRF } from './csrf-protection';

/**
 * Interface for csrfFetch options, extending the standard fetch options
 */
interface CSRFFetchOptions extends RequestInit {
  skipCSRF?: boolean; // Option to skip CSRF protection for specific requests
}

/**
 * Get the current CSRF token from the client-side
 * @returns Promise resolving to the CSRF token
 */
export async function getCSRFToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf');
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

/**
 * Fetch wrapper that automatically includes CSRF tokens in requests
 * @param url The URL to fetch
 * @param options Standard fetch options with additional CSRF options
 * @returns Promise resolving to the fetch response
 */
export async function csrfFetch(
  url: string,
  options: CSRFFetchOptions = {}
): Promise<Response> {
  // Skip CSRF for GET, HEAD, OPTIONS requests or if explicitly skipped
  const skipCSRF = 
    options.skipCSRF || 
    !options.method || 
    ['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase());

  if (skipCSRF) {
    return fetch(url, options);
  }

  // Get CSRF token for protected requests
  const csrfToken = await getCSRFToken();
  
  // Create headers with CSRF token
  const headers = new Headers(options.headers || {});
  headers.set(CSRF.HEADER_NAME, csrfToken);
  
  // Return fetch with CSRF protection
  return fetch(url, {
    ...options,
    headers,
  });
}