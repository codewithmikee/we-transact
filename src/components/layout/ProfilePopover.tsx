"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { User, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import { useSessionStore } from "@/stores/session.store";
import { logoutApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  sy_super_admin: "System Super Admin",
  sy_admin: "System Admin",
  org_super_admin: "Org Super Admin",
  org_admin: "Org Admin",
};

export function ProfilePopover() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const accessToken = useSessionStore((s) => s.accessToken);
  const clearSession = useSessionStore((s) => s.clearSession);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const displayName = user?.name ?? "Loading…";
  const roleLabel = user?.role ? (ROLE_LABELS[user.role] ?? user.role) : "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
    <Menu as="div" className="relative ml-3">
      <div>
        <MenuButton className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold leading-none text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500 mt-1">{roleLabel}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
              <span className="text-indigo-700 font-medium">{initials}</span>
            </div>
          </div>
        </MenuButton>
      </div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 z-10 mt-2 w-52 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {user && (
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-xs text-slate-500 truncate">{user.user_name}</p>
            </div>
          )}
          <MenuItem>
            {({ focus }) => (
              <a
                href="#"
                className={cn(
                  focus ? "bg-slate-100" : "",
                  "flex items-center gap-2 px-4 py-2 text-sm text-slate-700",
                )}
              >
                <User className="h-4 w-4" /> Your Profile
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={cn(
                  focus ? "bg-slate-100" : "",
                  "flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 disabled:opacity-60",
                )}
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sign out
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
