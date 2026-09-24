/**
 * Utility to validate and sanitize external URLs before rendering
 * to prevent XSS attacks (e.g., javascript: URIs) and broken links.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // If URL parsing fails, check if adding https:// makes it valid
    try {
      if (!trimmed.includes('://') && !trimmed.startsWith('javascript:')) {
        const parsed = new URL(`https://${trimmed}`);
        if (parsed.protocol === 'https:') {
          return parsed.href;
        }
      }
    } catch {
      // Invalid URL format
    }
  }

  return '#';
}
