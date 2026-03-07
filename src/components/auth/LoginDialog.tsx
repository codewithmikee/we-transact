"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import AppDialog from "@/components/ui/AppDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { loginApi } from "@/lib/api/auth";
import { useSessionStore } from "@/stores/session.store";

interface LoginDialogProps {
  /** When true the dialog has no close button and cannot be dismissed */
  required?: boolean;
  redirectTo?: string;
}

export function LoginDialog({
  required = false,
  redirectTo,
}: LoginDialogProps) {
  const router = useRouter();

  const setSession = useSessionStore((s) => s.setSession);

  // Prevent SSR/hydration mismatch: HeadlessUI Dialog renders a portal on the
  // client that doesn't exist during server rendering. Only open after mount.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const data = await loginApi({ user_name: username, password });
      setSession({
        user: data.user,
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt,
      });

      const redirect =
        redirectTo ??
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null);
      const { role, organization } = data.user;

      if (redirect) {
        router.push(redirect);
      } else if (role === "sy_super_admin" || role === "sy_admin") {
        router.push("/system");
      } else if (organization?.slug) {
        router.push(`/org/${organization.slug}`);
      } else {
        router.refresh();
      }
    } catch (err: unknown) {
      const e = err as { status?: number; data?: { message?: string; errors?: Record<string, string[]>; retry_after?: number } };
      if (e?.status === 422 && e.data?.errors) {
        setFieldErrors(e.data.errors);
        setError(e.data.message ?? "Please fix the errors below.");
      } else if (e?.status === 429) {
        setError(
          `Too many login attempts. Try again in ${e.data?.retry_after ?? "a few"} seconds.`,
        );
      } else {
        setError(
          (e as { data?: { message?: string } })?.data?.message ?? "Login failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppDialog
      open={mounted}
      onClose={() => {
        if (!required) router.back();
      }}
      canClose={!required && !loading}
      showCloseButton={!required}
      maxWidth="sm"
      title={
        <div className="flex items-center gap-2">
          <LogIn className="h-5 w-5 text-primary" />
          <span>Sign in to your account</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Global error */}
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label
            htmlFor="user_name"
            className="block text-sm font-medium text-foreground/80"
          >
            Username
          </label>
          <Input
            id="user_name"
            type="text"
            autoComplete="username"
            autoFocus
            required
            disabled={loading}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={cn(
              fieldErrors.user_name ? "border-destructive focus-visible:ring-destructive" : "",
            )}
            placeholder="Enter your username"
          />
          {fieldErrors.user_name && (
            <p className="text-xs text-destructive">{fieldErrors.user_name[0]}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground/80"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "pr-10",
                fieldErrors.password
                  ? "border-destructive focus-visible:ring-destructive"
                  : "",
              )}
              placeholder="Enter your password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AppDialog>
  );
}
