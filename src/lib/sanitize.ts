/**
 * Safely parses and sanitizes external URLs to prevent XSS (e.g. javascript:)
 * and ensure valid HTTP/HTTPS link targets.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const trimmed = url.trim();

  // Allow relative path links
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // Return '#' if URL parsing fails
  }

  return '#';
}
