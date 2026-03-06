import { Suspense } from "react";
import { AppLogo } from "@/components/layout/AppLogo";
import { LoginDialog } from "@/components/auth/LoginDialog";

export const metadata = {
  title: "Sign in",
};

/**
 * Login page — renders the login dialog over a branded background.
 * The dialog is always open and cannot be dismissed (required=true).
 * Middleware redirects authenticated users away from this page.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <AppLogo />
      </div>

      {/*
        LoginDialog uses useSearchParams internally, so wrap in Suspense
        to satisfy Next.js static rendering requirements.
      */}
      <Suspense>
        <LoginDialog required />
      </Suspense>
    </div>
  );
}
