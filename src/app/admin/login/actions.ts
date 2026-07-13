'use server';

import { setAuthCookie, removeAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function login(prevState: unknown, formData: FormData) {
  const password = formData.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === adminPassword) {
    await setAuthCookie();
    redirect('/admin/tasks');
  } else {
    return { error: 'Invalid password' };
  }
}

export async function logout() {
  await removeAuthCookie();
  redirect('/admin/login');
}
