'use client';

import React, { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {});

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Admin Portal Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your administrative token to manage competitor benchmarking tasks.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <form action={formAction} className="space-y-6">
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Access Token
              </label>
              <div className="mt-1">
                <input
                  id="token"
                  name="token"
                  type="password"
                  required
                  placeholder="Enter ADMIN_TOKEN"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 focus-visible:ring-2 focus-visible:ring-offset-2"
                />
              </div>
            </div>

            {state?.error && (
              <div className="text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {state.error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                {isPending ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
