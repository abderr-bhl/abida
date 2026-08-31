'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your admin authentication token to access automated task management.
          </p>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          {state?.error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-md">
              {state.error}
            </div>
          )}
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              placeholder="Enter ADMIN_TOKEN"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-xs focus:ring-2 focus:ring-[#0060df] focus:border-[#0060df] dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-[#0060df] hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#0060df] disabled:opacity-50"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
