export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    if (url.startsWith('/') || url.startsWith('#')) {
      return url;
    }
  }
  return '#';
}
