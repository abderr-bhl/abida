'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get('token') as string;
  const expectedToken = process.env.ADMIN_TOKEN || 'default-admin-token';

  if (!token || token !== expectedToken) {
    return { error: 'Invalid admin credentials or token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    maxAge: 86400,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  redirect('/admin/tasks');
}
