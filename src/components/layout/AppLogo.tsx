import Link from "next/link";
import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
        B
      </div>
      <span className="font-bold text-xl tracking-tight text-slate-900">
        Breeze<span className="text-indigo-600">UI</span>
      </span>
    </Link>
  );
}
