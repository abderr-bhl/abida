'use server';

import { redirect } from 'next/navigation';
import { setAuthCookie, clearAuthCookie } from '@/lib/auth';

export async function login(formData: FormData) {
  const password = formData.get('password');
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev-secret';

  if (password === ADMIN_TOKEN) {
    await setAuthCookie();
    redirect('/admin/tasks');
  }

  return { error: 'Invalid password' };
}

export async function logout() {
  await clearAuthCookie();
  redirect('/admin/login');
}
