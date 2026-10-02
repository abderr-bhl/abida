/**
 * Sanitizes external URLs before rendering to prevent XSS and ensure link safety.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  const trimmed = url.trim();

  // Allow standard relative paths or safe protocols (http, https, mailto, tel)
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }

  // Fallback to safe anchor
  return '#';
}
