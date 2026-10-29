'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function adminLogin(
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get('token') as string;
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token';

  if (!token || token !== expectedToken) {
    return { error: 'Invalid admin token' };
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
