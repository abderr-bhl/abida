/**
 * Safely parses and sanitizes external URLs before rendering to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const trimmed = url.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    if (/^(https?:\/\/|\/|#)/i.test(trimmed)) {
      return trimmed;
    }
  }

  return '#';
}
