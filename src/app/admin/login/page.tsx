'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Admin Login
        </h1>
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Access Token
            </label>
            <input
              type="password"
              id="token"
              name="token"
              required
              placeholder="Enter ADMIN_TOKEN"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-primary text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
