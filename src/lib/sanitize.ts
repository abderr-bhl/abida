export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return '#';
  } catch {
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
    return '#';
  }
}
