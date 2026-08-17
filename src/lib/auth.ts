import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(): Promise<boolean> {
  const adminTokenEnv = process.env.ADMIN_TOKEN;
  if (!adminTokenEnv) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!token) {
    return false;
  }

  return token === adminTokenEnv;
}

export async function requireAuth(): Promise<void> {
  const isAuth = await checkAuth();
  if (!isAuth) {
    redirect('/admin/login');
  }
}
