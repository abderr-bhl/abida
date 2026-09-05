/**
 * Safely parses and sanitizes external URLs before rendering to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (!trimmed) return '#';

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return trimmed;
    }
  }

  return '#';
}
