'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Admin Access Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter your secret admin token to manage automated competitive benchmark tasks.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          {state?.error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-700 font-medium">{state.error}</p>
            </div>
          )}

          <div>
            <label htmlFor="token" className="block text-sm font-medium text-slate-700">
              Admin Token
            </label>
            <div className="mt-1">
              <input
                id="token"
                name="token"
                type="password"
                required
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-slate-900 sm:text-sm"
                placeholder="Enter secret token..."
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-[#0060df] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
