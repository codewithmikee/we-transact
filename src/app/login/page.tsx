import { AuthScreen } from "@/features/auth/AuthScreen";

export const metadata = {
  title: "Sign in",
};

/**
 * Login page — renders the login dialog over a branded background.
 * The dialog is always open and cannot be dismissed (required=true).
 * Middleware redirects authenticated users away from this page.
 */
export default function LoginPage() {
  return <AuthScreen />;
}
