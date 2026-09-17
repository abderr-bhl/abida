/**
 * Safely parses and sanitizes external URLs before rendering to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';

  const trimmed = url.trim();

  // Handle Javascript / Data URIs
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '#';
  }

  try {
    const parsed = new URL(trimmed, 'https://reviewguid.com');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
    return '#';
  } catch {
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
    return '#';
  }
}
