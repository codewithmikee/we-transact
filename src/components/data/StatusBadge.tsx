import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  labels?: { active?: string; inactive?: string };
  className?: string;
}

export function StatusBadge({
  active,
  labels = { active: "Active", inactive: "Inactive" },
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground",
        )}
      />
      {active ? labels.active : labels.inactive}
    </span>
  );
}

/** Availability badge (is_available) */
export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <StatusBadge
      active={available}
      labels={{ active: "Available", inactive: "Unavailable" }}
    />
  );
}

/** Agent account status badge */
export function AccountStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-primary/10 text-primary",
    inactive: "bg-muted text-muted-foreground",
    suspended: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        map[status] ?? "bg-slate-100 text-slate-500",
      )}
    >
      {status}
    </span>
  );
}
