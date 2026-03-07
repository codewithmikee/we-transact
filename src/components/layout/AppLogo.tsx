import Link from "next/link";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  href?: string;
}

export function AppLogo({ className, href = "/" }: AppLogoProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        R
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Relay<span className="text-primary">Pay</span>
      </span>
    </Link>
  );
}
