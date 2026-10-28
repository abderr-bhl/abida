'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key';

  if (!password || password !== adminToken) {
    return { error: 'Invalid admin credentials' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  redirect('/admin/tasks');
}
