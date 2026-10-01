/**
 * Validates and sanitizes external URLs to ensure safety against XSS attacks
 * and ensure valid HTTP/HTTPS formatting.
 */
export function sanitizeUrl(urlStr: string | null | undefined): string {
  if (!urlStr) {
    return '#';
  }

  const trimmed = urlStr.trim();
  if (!trimmed) {
    return '#';
  }

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Return hash fallback if URL parsing fails
    return '#';
  }

  return '#';
}

export function isValidUrl(urlStr: string | null | undefined): boolean {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
