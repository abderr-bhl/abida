'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<{ error?: string }> {
  const tokenInput = formData.get('token') as string;
  const expectedToken = process.env.ADMIN_TOKEN || 'admin123';

  if (!tokenInput || tokenInput.trim() !== expectedToken) {
    return { error: 'Invalid admin token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
    path: '/'
  });

  redirect('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
