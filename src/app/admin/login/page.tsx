'use client';

import { useActionState } from 'react';
import { loginAdminAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, null);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard Login</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Enter your admin secret token to access task management
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Admin Access Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              placeholder="Enter ADMIN_TOKEN"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-[#0060df] hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
