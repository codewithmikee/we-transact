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
    suspended: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}

/** Transaction status badge */
export function TransactionStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:                "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    assigned:               "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    processing:             "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    awaiting_confirmation:  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    completed:              "bg-primary/10 text-primary",
    rejected:               "bg-destructive/10 text-destructive",
    cancelled:              "bg-muted text-muted-foreground",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        map[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

/** Transaction type badge */
export function TransactionTypeBadge({ type }: { type: string }) {
  const isDeposit = type === "deposit";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        isDeposit
          ? "bg-primary/10 text-primary"
          : "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      )}
    >
      {type}
    </span>
  );
}

/** Transaction source badge */
export function TransactionSourceBadge({ source }: { source: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        source === "dashboard"
          ? "bg-muted text-muted-foreground"
          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      )}
    >
      {source}
    </span>
  );
}
