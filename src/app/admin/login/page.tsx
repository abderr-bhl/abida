"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Admin Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your admin access token to manage automated competitive tasks.
          </p>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter ADMIN_TOKEN"
            />
          </div>

          {state?.error && (
            <div className="text-red-600 text-sm font-medium text-center bg-red-50 p-2 rounded">
              {state.error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? "Authenticating..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
