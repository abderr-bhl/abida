'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const tokenInput = formData.get('token')?.toString();
  const expectedToken = process.env.ADMIN_TOKEN || 'admin-secret-key-123';

  if (!tokenInput || tokenInput !== expectedToken) {
    return { error: 'Invalid admin token. Access denied.' };
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
