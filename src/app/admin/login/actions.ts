'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'ADMIN_TOKEN environment variable is not configured.' };
  }

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid password' };
}
