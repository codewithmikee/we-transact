import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "indigo" | "slate";
}

export function Spinner({ size = "md", className, variant = "indigo" }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  const variants = {
    indigo: "border-indigo-200 border-t-indigo-600",
    slate: "border-slate-200 border-t-slate-800",
  };

  return (
    <div 
      className={cn(
        "rounded-full animate-spin",
        sizes[size],
        variants[variant],
        className
      )} 
    />
  );
}
