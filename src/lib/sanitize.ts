/**
 * Sanitizes external URLs to prevent XSS and ensure proper formatting.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  const trimmed = url.trim();

  // Allow standard HTTP/HTTPS URLs
  if (/^(https?:\/\/)/i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.href;
    } catch {
      return '#';
    }
  }

  // Handle relative paths or fallback safely
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return '#';
}
