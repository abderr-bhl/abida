'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const password = formData.get('password')?.toString();
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-token-123';

  if (!password || password !== expectedToken) {
    return { error: 'Invalid password. Please try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/'
  });

  redirect('/admin/tasks');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
