export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) {
    return '#';
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If invalid URL, check if it's a relative path starting with /
    if (url.startsWith('/')) {
      return url;
    }
  }

  return '#';
}
