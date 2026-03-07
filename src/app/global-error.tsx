"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

// global-error replaces the root layout when an error occurs inside it.
// Must include <html> and <body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="text-center max-w-sm w-full">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 p-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Critical error
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              A fatal error occurred. Please try refreshing the page.
              {error.digest && (
                <span className="block mt-1 font-mono text-xs text-gray-400">
                  ID: {error.digest}
                </span>
              )}
            </p>

            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
