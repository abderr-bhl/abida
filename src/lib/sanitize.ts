/**
 * URL validation and sanitization utility to ensure links are safe.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) {
    return '#';
  }

  const trimmed = url.trim();

  // Allow standard http and https protocols
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      return '#';
    }
  }

  // Allow relative URLs starting with / (excluding protocol-relative //)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  return '#';
}
