/**
 * Sanitizes and validates external URLs before rendering in href attributes.
 * Prevents javascript: and malformed URIs.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Return fallback for invalid URLs
  }
  return '#';
}
