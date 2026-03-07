import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "muted";
}

export function Spinner({
  size = "md",
  className,
  variant = "primary",
}: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  const variants = {
    primary: "border-primary/20 border-t-primary",
    muted: "border-border border-t-foreground",
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
