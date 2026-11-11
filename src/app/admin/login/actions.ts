'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: unknown, formData: FormData) {
  const tokenInput = formData.get('token') as string;
  const expectedToken = process.env.ADMIN_TOKEN || 'admin';

  if (!tokenInput || (process.env.ADMIN_TOKEN ? tokenInput !== expectedToken : tokenInput !== 'admin')) {
    return { error: 'Invalid admin credentials or security token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', process.env.ADMIN_TOKEN ? expectedToken : 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
    path: '/'
  });

  redirect('/admin/tasks');
}
