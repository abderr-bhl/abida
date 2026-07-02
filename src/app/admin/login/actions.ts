'use server';

import { login as authLogin, logout as authLogout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  const success = await authLogin(password);

  if (success) {
    redirect('/admin/tasks');
  } else {
    throw new Error('Invalid password');
  }
}

export async function logoutAction() {
  await authLogout();
  redirect('/admin/login');
}
