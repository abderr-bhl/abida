/**
 * Validates and sanitizes external URLs to ensure safety against XSS attacks and malformed inputs.
 */
export function sanitizeUrl(urlStr: string | null | undefined): string {
  if (!urlStr || typeof urlStr !== 'string') {
    return '#';
  }

  const trimmed = urlStr.trim();
  if (!trimmed) {
    return '#';
  }

  // Allow relative URLs starting with '/'
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Return placeholder '#' if invalid URL
    return '#';
  }

  return '#';
}
