/**
 * Sanitizes and validates external URLs to prevent XSS attacks and ensure proper link formatting.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed;
  }
  return '#';
}
