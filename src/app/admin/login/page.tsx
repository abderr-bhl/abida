'use client';

import { useActionState } from 'react';
import { adminLogin } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Admin Portal Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          ReviewGuid Competitor Benchmarking Dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-800">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm rounded-md">
                {state.error}
              </div>
            )}
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Admin Security Token
              </label>
              <div className="mt-1">
                <input
                  id="token"
                  name="token"
                  type="password"
                  required
                  placeholder="Enter your secret token"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
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
