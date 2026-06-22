export function getAdminToken() {
  // In a real app, this might come from a secure cookie or a more robust auth system.
  // For this demo, we'll use an environment variable.
  // DO NOT hardcode secrets here.
  return process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin';
}

export function validateAdminToken(token: string | null) {
  const secret = process.env.ADMIN_TOKEN || 'admin';

  // Security: In production, never allow 'admin' as a fallback
  if (process.env.NODE_ENV === 'production' && secret === 'admin') {
    console.error('CRITICAL: ADMIN_TOKEN environment variable is not set in production.');
    return false;
  }

  return token === `Bearer ${secret}`;
}
