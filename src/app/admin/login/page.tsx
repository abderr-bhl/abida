'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: '',
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Automated Competitive Benchmarking & Task Management
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          {state?.error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Admin Secret Key
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter ADMIN_TOKEN"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition"
          >
            {isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
