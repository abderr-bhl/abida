import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAuth(tokenToCheck?: string): Promise<boolean> {
  const adminTokenEnv = process.env.ADMIN_TOKEN;
  if (!adminTokenEnv) {
    console.error('ADMIN_TOKEN environment variable is not defined.');
    return false;
  }

  let token = tokenToCheck;
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('admin-token')?.value;
  }

  if (!token) {
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
