'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(_prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString().trim();
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key';

  if (token === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 86400, // 24 hours
      path: '/',
    });
    redirect('/admin/tasks');
  }

  return { error: 'Invalid admin token' };
}
