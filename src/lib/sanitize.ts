/**
 * Validates and sanitizes external URLs to prevent XSS and link integrity issues.
 * Only allows HTTP and HTTPS protocols.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Return safe fallback if parsing fails
  }
  return '#';
}
