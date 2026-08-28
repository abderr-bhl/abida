/**
 * Safely parses and sanitizes external URLs to prevent XSS attacks and ensure link integrity.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) {
    return '#';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '#';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If URL parsing fails, check for safe relative paths starting with '/'
    if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('\\')) {
      return trimmed;
    }
  }

  return '#';
}
