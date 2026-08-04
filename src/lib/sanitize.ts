export function sanitizeUrl(urlStr: string): string {
  if (!urlStr) return '#';
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
  } catch {
    if (urlStr.startsWith('/') || urlStr.startsWith('#')) {
      return urlStr;
    }
  }
  return '#';
}
