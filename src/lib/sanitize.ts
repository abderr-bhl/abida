/**
 * Validates and sanitizes external URLs to prevent XSS attacks (e.g. javascript: links).
 * Only http and https URLs are allowed.
 */
export function sanitizeUrl(url?: string): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If invalid URL structure, fallback safely
    return '#';
  }

  return '#';
}
