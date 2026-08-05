/**
 * Safely parses and sanitizes external URLs to prevent XSS attacks
 * and ensure link integrity.
 */
export function sanitizeUrl(urlStr: string): string {
  if (!urlStr) return '';
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // If it's a relative URL or invalid absolute URL, return empty string for security
  }
  return '';
}
