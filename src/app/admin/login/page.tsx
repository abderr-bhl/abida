'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-blue-50 dark:bg-blue-950 rounded-full mb-3">
            Internal Operations
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Authentication
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your administrative token to access the competitive benchmark &amp; task automation engine.
          </p>
        </div>

        {state?.error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="token"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Admin Security Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              placeholder="Enter ADMIN_TOKEN"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
