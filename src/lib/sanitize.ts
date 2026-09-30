/**
 * Safely validates and sanitizes external URLs to prevent XSS and ensure link integrity.
 */
export function sanitizeUrl(urlStr: string | null | undefined): string {
  if (!urlStr || typeof urlStr !== 'string') {
    return '#';
  }

  const trimmedStr = urlStr.trim();

  // Allow anchor links
  if (trimmedStr.startsWith('#')) {
    return trimmedStr;
  }

  // Allow relative URLs starting with '/'
  if (trimmedStr.startsWith('/') && !trimmedStr.startsWith('//')) {
    return trimmedStr;
  }

  try {
    const parsedUrl = new URL(trimmedStr);
    const protocol = parsedUrl.protocol.toLowerCase();

    // Only allow http: and https: protocols
    if (protocol === 'http:' || protocol === 'https:') {
      return parsedUrl.toString();
    }
  } catch {
    // Return fallback if parsing fails
    return '#';
  }

  return '#';
}
