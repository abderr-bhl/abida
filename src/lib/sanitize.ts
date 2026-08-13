/**
 * Safely validates and sanitizes a URL to prevent XSS (e.g. javascript: urls)
 * and ensure link integrity.
 */
export function sanitizeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url) return fallback;

  const trimmed = url.trim();

  // Prevent javascript:, data:, vbscript: protocols
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return fallback;
  }

  try {
    // Allow relative paths and anchor links directly
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return trimmed;
    }

    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return fallback;
  } catch {
    // If parsing fails but it looks like a valid protocol-less external URL (e.g., "www.amazon.com")
    // we prepend https://
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return fallback;
  }
}
