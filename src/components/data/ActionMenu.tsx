"use client";

import { Fragment } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: ActionItem[];
  /** @default "bottom end" */
  align?: "start" | "end";
}

export function ActionMenu({ actions, align = "end" }: ActionMenuProps) {
  return (
    <Menu as="div" className="relative inline-block z-50 text-left">
      <MenuButton className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none">
        <MoreHorizontal className="h-4 w-4" />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            "absolute z-50 mt-1 w-44 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div className="py-1">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <MenuItem key={action.label} disabled={action.disabled}>
                  {({ focus, disabled }) => (
                    <button
                      onClick={action.onClick}
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                        focus && !action.destructive && "bg-slate-50",
                        focus && action.destructive && "bg-red-50",
                        action.destructive ? "text-red-600" : "text-slate-700",
                        disabled && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                      {action.label}
                    </button>
                  )}
                </MenuItem>
              );
            })}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
