/**
 * Utility to sanitize and validate external URLs (e.g. Amazon affiliate links or competitor URLs)
 * to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) {
    return '#';
  }

  const trimmed = url.trim();

  // Allow absolute HTTP and HTTPS URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      return '#';
    }
  }

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  return '#';
}
