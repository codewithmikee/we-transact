"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";
import { AuthScreen } from "@/features/auth/AuthScreen";
import { useSessionStore } from "@/stores/session.store";
import { DashboardShell } from "./DashboardShell";

function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/system") ||
    pathname.startsWith("/org") ||
    pathname.startsWith("/change-password")
  );
}

function AppLoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
      <Spinner variant="primary" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Preparing your workspace</p>
        <p className="text-sm text-muted-foreground">
          Checking session state and loading the dashboard shell.
        </p>
      </div>
    </div>
  );
}

export function ProtectedAppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useSessionStore((state) => state.user);
  const isSessionReady = useSessionStore((state) => state.isSessionReady);
  const [isPageReady, setIsPageReady] = React.useState(false);

  React.useEffect(() => {
    setIsPageReady(true);
  }, []);

  if (!isProtectedPath(pathname)) {
    return <>{children}</>;
  }

  if (!isSessionReady || !isPageReady) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    const redirectTo =
      pathname === "/change-password" ? "/change-password" : pathname;
    return <AuthScreen redirectTo={redirectTo} />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
