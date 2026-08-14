/**
 * Utility function to validate and sanitize external URLs.
 * To satisfy Server Action requirements where synchronous utility functions must be kept separated or declared inside client components/dynamic helper modules,
 * we keep this here.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If it's a relative URL or invalid URL, fallback or clean up safely
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
  }
  return '#';
}
