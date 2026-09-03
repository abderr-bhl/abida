'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const token = formData.get('token') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Server authentication configuration missing.' };
  }

  if (token === adminToken) {
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

  return { error: 'Invalid admin token.' };
}
