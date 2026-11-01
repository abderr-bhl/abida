/**
 * Validates and sanitizes external URLs to prevent XSS and malformed links.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();

  // Allow standard http and https protocols only
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.toString();
    } catch {
      return '#';
    }
  }

  // Relative URLs starting with '/'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  return '#';
}
