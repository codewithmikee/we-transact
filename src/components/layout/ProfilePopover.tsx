"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export function ProfilePopover({ userName = "Alex Dev", role = "Admin" }) {
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <MenuButton className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold leading-none text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500 mt-1">{role}</p>
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
        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <MenuItem>
            {({ focus }) => (
              <a href="#" className={cn(focus ? "bg-slate-100" : "", "flex items-center gap-2 px-4 py-2 text-sm text-slate-700")}>
                <User className="h-4 w-4" /> Your Profile
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <a href="#" className={cn(focus ? "bg-slate-100" : "", "flex items-center gap-2 px-4 py-2 text-sm text-slate-700")}>
                <Settings className="h-4 w-4" /> Settings
              </a>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <a href="#" className={cn(focus ? "bg-slate-100" : "", "flex items-center gap-2 px-4 py-2 text-sm text-red-600")}>
                <LogOut className="h-4 w-4" /> Sign out
              </a>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
