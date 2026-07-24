import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;
  const adminTokenEnv = process.env.ADMIN_TOKEN;

  // Security: No fallback values allowed
  if (!adminTokenEnv || !token) {
    return false;
  }

  return token === adminTokenEnv;
}

export async function requireAuth(): Promise<void> {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}
