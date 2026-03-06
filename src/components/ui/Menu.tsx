"use client";

import * as React from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const DropdownMenu = ({ 
  label, 
  children, 
  className,
  buttonClassName 
}: { 
  label: React.ReactNode; 
  children: React.ReactNode; 
  className?: string;
  buttonClassName?: string;
}) => (
  <Menu as="div" className={cn("relative inline-block text-left", className)}>
    <div>
      <MenuButton className={cn(
        "inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50",
        buttonClassName
      )}>
        {label}
        <ChevronDown className="-mr-1 h-5 w-5 text-slate-400" aria-hidden="true" />
      </MenuButton>
    </div>

    <Transition
      as={React.Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {children}
        </div>
      </MenuItems>
    </Transition>
  </Menu>
);

const DropdownMenuItem = ({ 
  children, 
  onClick, 
  className,
  disabled 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  disabled?: boolean;
}) => (
  <MenuItem disabled={disabled}>
    {({ focus, disabled }) => (
      <button
        onClick={onClick}
        className={cn(
          focus ? "bg-slate-100 text-slate-900 outline-none" : "text-slate-700",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          "group flex w-full items-center px-4 py-2 text-sm",
          className
        )}
      >
        {children}
      </button>
    )}
  </MenuItem>
);

export { DropdownMenu, DropdownMenuItem };
