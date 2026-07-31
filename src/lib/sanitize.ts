/**
 * Validates and sanitizes URLs before rendering to protect against XSS and ensure link integrity.
 */
export function sanitizeUrl(urlStr: string): string {
  try {
    const trimmed = urlStr.trim();
    if (!trimmed) return '#';

    // Prevent javascript: and other dangerous protocols
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return '#';
  } catch {
    // If parsing fails, allow safe relative paths
    if (urlStr.startsWith('/') || urlStr.startsWith('#')) {
      return urlStr;
    }
    return '#';
  }
}
