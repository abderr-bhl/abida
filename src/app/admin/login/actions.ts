'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString().trim();
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'ADMIN_TOKEN environment variable is not configured on the server.' };
  }

  if (token !== adminToken) {
    return { error: 'Invalid admin token.' };
  }

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
