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
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-sm w-full">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>

            <h1 className="text-xl font-semibold text-foreground mb-2">
              Critical error
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              A fatal error occurred. Please try refreshing the page.
              {error.digest && (
                <span className="block mt-1 font-mono text-xs text-muted-foreground">
                  ID: {error.digest}
                </span>
              )}
            </p>

            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
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
