'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString();
  const adminTokenEnv = process.env.ADMIN_TOKEN;

  if (!adminTokenEnv) {
    return { error: 'Server configuration error: ADMIN_TOKEN is not set' };
  }

  if (token === adminTokenEnv) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid admin token' };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
