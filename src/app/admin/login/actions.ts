'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdminAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-token';

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400, // 24 hours
      path: '/',
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid admin credentials' };
}
