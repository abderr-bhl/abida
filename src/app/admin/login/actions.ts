'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const token = formData.get('token') as string;
  const adminToken = process.env.ADMIN_TOKEN || 'admin-secret-key';

  if (!token || token.trim() !== adminToken) {
    return { error: 'Invalid admin authentication token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', adminToken, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400 // 24 hours
  });

  redirect('/admin/tasks');
}
