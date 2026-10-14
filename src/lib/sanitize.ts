/**
 * Safely parses and sanitizes external URLs before rendering to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(urlStr: string | null | undefined): string {
  if (!urlStr) {
    return '#';
  }

  const trimmed = urlStr.trim();

  // Allow safe relative paths
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Fallback if URL parsing fails
  }

  return '#';
}
