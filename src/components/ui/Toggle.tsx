"use client";

import * as React from "react";
import { Switch } from "@headlessui/react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

const Toggle = ({ checked, onChange, className, disabled }: ToggleProps) => {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" : "bg-muted/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]",
        className
      )}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] ring-0 transition-transform duration-300 ease-in-out",
          checked ? "translate-x-5.5" : "translate-x-1"
        )}
      />
    </Switch>
  );
};

export { Toggle };
