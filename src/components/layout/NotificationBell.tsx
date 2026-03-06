"use client";

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Bell } from "lucide-react";
import React from "react";

export function NotificationBell() {
  const notifications = [
    { id: 1, text: "New organization created", time: "2 hours ago" },
    { id: 2, text: "Organization 'Test' updated", time: "5 hours ago" },
    { id: 3, text: "Welcome to the new system", time: "1 day ago" },
  ];

  return (
    <Popover className="relative">
      <PopoverButton className="p-2 rounded-full text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <span className="sr-only">Notifications</span>
        <Bell className="h-6 w-6" aria-hidden="true" />
        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
      </PopoverButton>

      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-lg bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <button className="text-xs text-indigo-600 hover:text-indigo-500 font-medium">Mark all as read</button>
          </div>
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div key={n.id} className="group relative flex flex-col gap-1 p-2 hover:bg-slate-50 rounded-md transition-colors">
                <p className="text-sm text-slate-700 leading-tight">{n.text}</p>
                <span className="text-xs text-slate-400">{n.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2 border-t text-center">
            <button className="text-sm text-slate-500 hover:text-slate-600 font-medium">View all notifications</button>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
