export function sanitizeUrl(url: string): string {
  if (!url) return "#";

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return "#";
  } catch {
    // If relative URL, ensure it starts with /
    if (url.startsWith("/") || url.startsWith("#")) {
      return url;
    }
    return "#";
  }
}
