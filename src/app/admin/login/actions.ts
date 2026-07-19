'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAdmin(prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { success: false, error: 'Administration token is not configured on the server.' };
  }

  if (password === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set('admin-token', adminToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
    });

    // Perform redirect after successful cookie setup
    redirect('/admin/tasks');
  }

  return { success: false, error: 'Invalid admin token.' };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
