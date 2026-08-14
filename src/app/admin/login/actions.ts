'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginActionState {
  error?: string;
  success?: boolean;
}

/**
 * Server action for logging in. Sets the 'admin-token' cookie with a 24-hour expiration.
 * In Next.js 16.2.6, Server Actions used with useActionState must have the signature:
 * (prevState: unknown, formData: FormData)
 */
export async function loginAdminAction(
  prevState: LoginActionState | null | undefined | unknown,
  formData: FormData
): Promise<LoginActionState> {
  const token = formData.get('token') as string;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return { error: 'Admin token is not configured on the server.' };
  }

  if (token !== adminToken) {
    return { error: 'Invalid admin token.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('admin-token', token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24 hours
  });

  redirect('/admin/tasks');
}

/**
 * Server action to log out. Clears the 'admin-token' cookie and redirects to the login page.
 */
export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
  redirect('/admin/login');
}
