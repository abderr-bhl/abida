/**
 * Utility functions for sanitizing and validating URLs before rendering.
 */

export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '#';
  } catch {
    // If relative or invalid URL, fallback to '#' if invalid
    if (url.startsWith('/')) {
      return url;
    }
    return '#';
  }
}
