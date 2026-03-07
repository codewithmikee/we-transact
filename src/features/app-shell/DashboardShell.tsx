"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  KeyRound,
  LogOut,
  Menu,
  UserCircle2,
  X,
} from "lucide-react";
import {
  Menu as HeadlessMenu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AppLogo } from "@/components/layout/AppLogo";
import { cn } from "@/lib/utils";
import {
  ORGANiZATION_USER_NAV_ITEMS,
  SYSTEM_ADMIN_NAV_ITEMS,
} from "@/lib/nav-configs/nav-items";
import { logoutApi } from "@/lib/api/auth";
import { useSessionStore } from "@/stores/session.store";
import { NavConfig, NavItemContent } from "@/types/nav.types";
import { UserRole } from "@/types/api.types";

type ShellKind = "org" | "system" | "generic";

const ROLE_LABELS: Record<UserRole, string> = {
  sy_super_admin: "System Super Admin",
  sy_admin: "System Admin",
  org_super_admin: "Organization Super Admin",
  org_admin: "Organization Admin",
};

const EMPTY_NOTIFICATIONS = [
  "No new notifications yet.",
  "Platform alerts and account events can surface here later.",
];

function flattenNavItems(items: NavConfig[], role: UserRole | null) {
  const visibleItems: NavItemContent[] = [];

  for (const item of items) {
    if ("items" in item) {
      for (const child of item.items) {
        if (
          child.preventerUserRoles &&
          role &&
          child.preventerUserRoles.includes(role)
        ) {
          continue;
        }

        visibleItems.push(child);
      }

      continue;
    }

    if (
      item.preventerUserRoles &&
      role &&
      item.preventerUserRoles.includes(role)
    ) {
      continue;
    }

    visibleItems.push(item);
  }

  return visibleItems;
}

function resolveLink(link: string, params: Record<string, string | string[] | undefined>) {
  return link.replace(/\[(\w+)\]/g, (_, key) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] ?? `[${key}]` : value ?? `[${key}]`;
  });
}

function prettifySegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getShellKind(pathname: string): ShellKind {
  if (pathname.startsWith("/org")) return "org";
  if (pathname.startsWith("/system")) return "system";
  return "generic";
}

function getDefaultHomeHref(kind: ShellKind, role: UserRole | null, orgSlug?: string) {
  if (kind === "org" && orgSlug) {
    return `/org/${orgSlug}`;
  }

  if (kind === "system") {
    return "/system";
  }

  if (role === "org_admin" || role === "org_super_admin") {
    return orgSlug ? `/org/${orgSlug}` : "/login";
  }

  return role ? "/system" : "/login";
}

function getCurrentTitle(
  pathname: string,
  navItems: Array<NavItemContent & { href: string }>,
  homeHref: string,
) {
  if (pathname === "/change-password") {
    return "Change Password";
  }

  const activeItem = navItems.find((item) => {
    if (pathname === homeHref && item.href === homeHref) {
      return true;
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });

  if (activeItem) {
    return activeItem.title;
  }

  const lastSegment = pathname.split("/").filter(Boolean).at(-1);
  return lastSegment ? prettifySegment(lastSegment) : "Dashboard";
}

function NotificationBell() {
  return (
    <HeadlessMenu as="div" className="relative">
      <MenuButton className="relative rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="sr-only">Open notifications</span>
        <Bell className="h-5 w-5" />
      </MenuButton>
      <Transition
        as={React.Fragment}
        enter="transition duration-150 ease-out"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <MenuItems className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg focus:outline-none">
          <div className="border-b border-border pb-3">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Mock content for the starter shell.
            </p>
          </div>

          <div className="space-y-3 pt-3 text-sm text-muted-foreground">
            {EMPTY_NOTIFICATIONS.map((message) => (
              <div key={message} className="rounded-lg bg-muted/40 px-3 py-2">
                {message}
              </div>
            ))}
          </div>
        </MenuItems>
      </Transition>
    </HeadlessMenu>
  );
}

function ProfileMenu({
  homeHref,
  roleLabel,
}: {
  homeHref: string;
  roleLabel: string;
}) {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const accessToken = useSessionStore((state) => state.accessToken);
  const clearSession = useSessionStore((state) => state.clearSession);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "NA";

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logoutApi(accessToken ?? "");
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  return (
    <HeadlessMenu as="div" className="relative">
      <MenuButton className="flex items-center gap-3 rounded-full border border-border bg-background px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="hidden min-w-0 md:block">
          <p className="truncate text-sm font-semibold text-foreground">
            {user?.name ?? "Unknown user"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </div>
      </MenuButton>

      <Transition
        as={React.Fragment}
        enter="transition duration-150 ease-out"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <MenuItems className="absolute right-0 z-50 mt-3 w-72 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg focus:outline-none">
          <div className="rounded-lg bg-muted/40 px-3 py-3">
            <p className="text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground">@{user?.user_name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          <div className="mt-2 space-y-1">
            <MenuItem>
              {({ focus }) => (
                <Link
                  href={homeHref}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    focus && "bg-accent text-accent-foreground",
                  )}
                >
                  <UserCircle2 className="h-4 w-4" />
                  Workspace Home
                </Link>
              )}
            </MenuItem>

            <MenuItem>
              {({ focus }) => (
                <Link
                  href="/change-password"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    focus && "bg-accent text-accent-foreground",
                  )}
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Link>
              )}
            </MenuItem>

            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive disabled:opacity-60",
                    focus && "bg-destructive/10",
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Signing out..." : "Logout"}
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </HeadlessMenu>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<Record<string, string | string[]>>();
  const role = useSessionStore((state) => state.user?.role ?? null);
  const user = useSessionStore((state) => state.user);
  const accessToken = useSessionStore((state) => state.accessToken);
  const clearSession = useSessionStore((state) => state.clearSession);
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const shellKind = getShellKind(pathname);
  const defaultOrgSlug =
    typeof params.slug === "string"
      ? params.slug
      : user?.organization?.slug;
  const navConfig =
    shellKind === "org"
      ? ORGANiZATION_USER_NAV_ITEMS
      : shellKind === "system"
        ? SYSTEM_ADMIN_NAV_ITEMS
        : role === "org_admin" || role === "org_super_admin"
          ? ORGANiZATION_USER_NAV_ITEMS
          : SYSTEM_ADMIN_NAV_ITEMS;

  const navItems = flattenNavItems(navConfig, role);
  const resolvedNavItems = navItems.map((item) => ({
    ...item,
    href: resolveLink(item.link, params),
  }));
  const homeHref = getDefaultHomeHref(shellKind, role, defaultOrgSlug);
  const currentTitle = getCurrentTitle(pathname, resolvedNavItems, homeHref);
  const isNestedMobileView = pathname !== homeHref;
  const roleLabel = role ? ROLE_LABELS[role] : "Authenticated User";
  const orgLabel = defaultOrgSlug ? prettifySegment(defaultOrgSlug) : "Organization";
  const showOrgBanner =
    shellKind === "org" && (role === "sy_admin" || role === "sy_super_admin");

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logoutApi(accessToken ?? "");
    } finally {
      clearSession();
      router.push("/login");
    }
  };

  const profileSummary = user
    ? {
        name: user.name,
        username: `@${user.user_name}`,
        role: roleLabel,
      }
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showOrgBanner && (
        <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground md:px-6">
          <div className="mx-auto flex max-w-7xl items-center gap-2">
            <span className="font-semibold text-foreground">Viewing as system admin</span>
            <span className="text-muted-foreground/70">/</span>
            <span>Managing {orgLabel}</span>
            <Link
              href="/system/organizations"
              className="ml-auto text-foreground underline underline-offset-4"
            >
              Back to organizations
            </Link>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto hidden h-16 max-w-7xl items-center justify-between gap-6 px-6 md:flex">
          <AppLogo href={homeHref} />

          <nav className="flex min-w-0 flex-1 items-center justify-center gap-1">
            {resolvedNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <ProfileMenu homeHref={homeHref} roleLabel={roleLabel} />
          </div>
        </div>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:hidden">
          <div className="min-w-0">
            {isNestedMobileView ? (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{currentTitle}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {shellKind === "org" ? orgLabel : roleLabel}
                </p>
              </div>
            ) : (
              <AppLogo href={homeHref} />
            )}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              type="button"
              className="rounded-full border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/30 transition-opacity md:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex w-80 max-w-[calc(100vw-2rem)] flex-col border-l border-border bg-background px-5 py-5 transition-transform md:hidden",
          isSidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="border-b border-border pb-4">
          {profileSummary && (
            <div className="space-y-1">
              <p className="text-sm font-semibold">{profileSummary.name}</p>
              <p className="text-xs text-muted-foreground">{profileSummary.username}</p>
              <p className="text-xs text-muted-foreground">{profileSummary.role}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto py-5">
          {resolvedNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <span>{item.title}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-border pt-4">
          <Link
            href="/change-password"
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </aside>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 md:px-6 md:py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
