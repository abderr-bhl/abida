/**
 * Sanitizes and validates external URLs to prevent XSS and malformed links.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '#';
  }

  const trimmed = url.trim();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If URL parsing fails, check if adding https:// makes it valid
    try {
      if (!trimmed.includes('://') && !trimmed.toLowerCase().startsWith('javascript:')) {
        const parsedWithHttps = new URL(`https://${trimmed}`);
        return parsedWithHttps.toString();
      }
    } catch {
      // Return safe fallback
    }
  }

  return '#';
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
