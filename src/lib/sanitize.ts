/**
 * Utility function to sanitize external URLs before rendering
 * to prevent XSS vulnerabilities and invalid links.
 */
export function sanitizeUrl(url?: string): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url, 'https://reviewguid.com');
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    // Invalid URL structure
  }
  return '#';
}
