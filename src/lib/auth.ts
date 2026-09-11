import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!token || !adminToken || token !== adminToken) {
    redirect('/admin/login');
  }
}

export function isAuthenticatedRequest(req: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;

  const cookieToken = req.cookies.get('admin-token')?.value;
  if (cookieToken === adminToken) return true;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    if (bearerToken === adminToken) return true;
  }

  return false;
}
