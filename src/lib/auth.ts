import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');

  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || (process.env.NODE_ENV === 'development' ? 'admin' : null);

  if (!ADMIN_TOKEN) {
    return false;
  }

  return token?.value === ADMIN_TOKEN;
}
