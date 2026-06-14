import { NextRequest } from 'next/server';

export async function checkAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // In a real app, verify against a database or environment variable
  // For this benchmark task, we use a mock verification
  const ADMIN_TOKEN = process.env.AUTH_TOKEN || 'admin-secret-token';

  if (token !== ADMIN_TOKEN) {
    return false;
  }

  return true;
}
