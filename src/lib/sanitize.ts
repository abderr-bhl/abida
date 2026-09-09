/**
 * Validates and sanitizes external URLs to prevent XSS and broken links.
 */
export function sanitizeUrl(urlStr: string): string {
  if (!urlStr) return '#';
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '#';
  } catch {
    return '#';
  }
}
