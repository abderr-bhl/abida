import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates and sanitizes a URL to protect against XSS injection and ensure link integrity.
 * Only http and https URLs are allowed.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '#';

  const trimmed = url.trim();

  // Basic validation: must start with http:// or https:// (case insensitive)
  if (!/^https?:\/\//i.test(trimmed)) {
    return '#';
  }

  try {
    // Attempt parsing to ensure it's a valid URL format
    const parsed = new URL(trimmed);

    // Additional validation of protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#';
    }

    // Sanitize any characters that could break HTML or execute JS
    return parsed.toString()
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  } catch {
    return '#';
  }
}
