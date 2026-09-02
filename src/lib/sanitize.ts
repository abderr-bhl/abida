export function sanitizeUrl(urlStr: string | null | undefined): string {
  if (!urlStr) {
    return '#';
  }
  const trimmed = urlStr.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return '#';
  } catch {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
    return '#';
  }
}
