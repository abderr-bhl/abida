/**
 * Safely parses and sanitizes external URLs before rendering
 * to prevent XSS attacks and ensure link integrity.
 */
export function sanitizeUrl(urlStr: string | undefined | null): string {
  if (!urlStr || typeof urlStr !== 'string') {
    return '#';
  }

  const trimmed = urlStr.trim();
  if (!trimmed) {
    return '#';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If URL parsing fails, check for relative protocol or relative path if safe
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
  }

  return '#';
}
