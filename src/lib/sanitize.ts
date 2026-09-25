/**
 * URL validation and sanitization utility to ensure safe external links.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) {
    return '#';
  }

  const trimmed = url.trim();

  // Allow relative URLs starting with /
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Invalid URL format
  }

  return '#';
}

export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
