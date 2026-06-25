export async function isAdmin(token?: string | null): Promise<boolean> {
  const adminToken = process.env.ADMIN_TOKEN;

  // In development, allow a fallback if not set
  if (process.env.NODE_ENV === 'development') {
    if (!adminToken) return token === 'admin';
  }

  // In production or if set, must match ADMIN_TOKEN
  if (!adminToken) return false;
  return token === adminToken;
}

export async function validateCronSecret(token?: string | null): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  return token === cronSecret;
}
