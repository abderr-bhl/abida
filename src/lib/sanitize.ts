/**
 * Safely parses and sanitizes external URLs before rendering.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If URL parsing fails, return '#' or empty string safely
  }
  return '#';
}
