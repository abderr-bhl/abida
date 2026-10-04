/**
 * Utility to validate and sanitize external URLs before rendering.
 * Prevents XSS attacks like javascript: protocols.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return '#';
  const trimmed = url.trim();

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Return hash fallback if URL parsing fails
    return '#';
  }

  return '#';
}
