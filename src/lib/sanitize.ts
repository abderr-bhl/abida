/**
 * Utility to safely parse and sanitize external URLs.
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
    if (url.startsWith('/')) {
      return url;
    }
    return '#';
  }
}
