/**
 * Safely parses and sanitizes external URLs to prevent XSS attacks (e.g. javascript: URIs)
 * and ensure link integrity.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';

  const trimmed = url.trim();

  // Block dangerous schemes like javascript: or data:
  if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
    return '#';
  }

  // Handle absolute HTTP/HTTPS URLs
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return parsed.toString();
    } catch {
      return '#';
    }
  }

  // Handle relative links or mailto/tel
  if (trimmed.startsWith('/') || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }

  return '#';
}
