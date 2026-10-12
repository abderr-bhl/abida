export function validateAndSanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';

  const trimmed = url.trim();
  if (!trimmed) return '#';

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If not a valid absolute URL, check if it's a valid relative path starting with /
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
  }

  return '#';
}
