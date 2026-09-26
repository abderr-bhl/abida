/**
 * Safely parses and sanitizes external URLs to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(url: string | undefined | null): string {
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
