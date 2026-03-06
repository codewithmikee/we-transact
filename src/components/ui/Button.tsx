"use client";

import * as React from "react";
import { Button as HeadlessButton, ButtonProps as HeadlessButtonProps } from "@headlessui/react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends HeadlessButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-indigo-600 text-white data-[hover]:bg-indigo-700 data-[active]:bg-indigo-800 shadow-sm",
      secondary: "bg-slate-800 text-white data-[hover]:bg-slate-700 data-[active]:bg-slate-900",
      outline: "bg-white text-slate-700 border border-slate-200 data-[hover]:bg-slate-50 data-[active]:bg-slate-100 shadow-sm",
      ghost: "text-indigo-600 data-[hover]:underline data-[active]:text-indigo-800",
      danger: "bg-red-600 text-white data-[hover]:bg-red-700 data-[active]:bg-red-800",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <HeadlessButton
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" fill="none" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" />
          </svg>
        )}
        {typeof children === "function" ? children(props as any) : children}
      </HeadlessButton>
    );
  }
);
Button.displayName = "Button";

export { Button };
