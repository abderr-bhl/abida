/**
 * Safely parses and sanitizes external URLs before rendering to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) {
    return '#';
  }

  const trimmed = url.trim();
  if (trimmed === '') {
    return '#';
  }

  try {
    const parsed = new URL(trimmed);
    // Allow only http: and https: protocols
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '#';
  } catch {
    // If URL parsing fails, check for safe relative URLs or return '#'
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return '#';
  }
}
