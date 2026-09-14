'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get('token')?.toString() || '';
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret';

  if (!token) {
    return { error: 'Admin token is required.' };
  }

  if (token !== expectedToken) {
    return { error: 'Invalid admin token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  redirect('/admin/tasks');
}
