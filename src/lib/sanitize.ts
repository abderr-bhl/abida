/**
 * Utility for sanitizing and validating external URLs to prevent XSS and broken links.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Return safe fallback if URL parsing fails
  }
  return '#';
}
