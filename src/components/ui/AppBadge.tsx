import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Clock, XCircle, MinusCircle, Info, ArrowRightCircle } from 'lucide-react';

// Define the available standard statuses
export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'default' | 'assigned' | 'processing' | 'awaiting_confirmation' | 'purple' | 'indigo';

// --- Internal Configuration ---

interface StatusConfig {
  icon: React.ElementType;
  /** Tailwind classes for the badge variant */
  classNames: string;
  /** ARIA role for accessibility */
  role: 'status' | 'alert' | 'none';
}

const STATUS_MAP: Record<StatusType, StatusConfig> = {
  success: {
    icon: CheckCircle,
    classNames: "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
    role: 'status',
  },
  error: {
    icon: XCircle,
    classNames: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
    role: 'alert',
  },
  warning: {
    icon: AlertCircle,
    classNames: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30",
    role: 'alert',
  },
  info: {
    icon: Info,
    classNames: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
    role: 'status',
  },
  pending: {
    icon: Clock,
    classNames: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
    role: 'status',
  },
  assigned: {
    icon: ArrowRightCircle,
    classNames: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
    role: 'status',
  },
  processing: {
    icon: Clock,
    classNames: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
    role: 'status',
  },
  awaiting_confirmation: {
    icon: AlertCircle,
    classNames: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30",
    role: 'alert',
  },
  purple: {
    icon: Info,
    classNames: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
    role: 'status',
  },
  indigo: {
    icon: Info,
    classNames: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30",
    role: 'status',
  },
  default: {
    icon: MinusCircle,
    classNames: "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
    role: 'none',
  },
};

export interface AppBadgeProps {
  /** The text content displayed inside the badge. */
  children: React.ReactNode;
  /** The predefined status type to determine color and icon. */
  status: StatusType;
  /** Optional custom Tailwind classes for further styling. */
  className?: string;
  /** If true, the icon will not be displayed. */
  hideIcon?: boolean;
  /** If true, show a small dot next to the text. */
  dot?: boolean;
}

const AppBadge: React.FC<AppBadgeProps> = ({
  children,
  status,
  className,
  hideIcon = false,
  dot = false,
}) => {
  const config = useMemo(() => STATUS_MAP[status] || STATUS_MAP['default'], [status]);
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-default whitespace-nowrap",
        config.classNames,
        className
      )}
      role={config.role}
      aria-live={config.role === 'alert' ? 'assertive' : 'polite'}
    >
      {dot && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === 'success' ? "bg-green-600 animate-pulse" : "bg-current opacity-70"
        )} />
      )}
      {!hideIcon && !dot && (
        <IconComponent className="h-3 w-3 shrink-0" aria-hidden="true" />
      )}
      <span className="truncate">{children}</span>
    </div>
  );
};

// Specialized Badges

export function StatusBadge({
  active,
  labels = { active: "Active", inactive: "Inactive" },
  className,
}: {
  active: boolean;
  labels?: { active?: string; inactive?: string };
  className?: string;
}) {
  return (
    <AppBadge
      status={active ? "success" : "default"}
      dot
      className={className}
    >
      {active ? labels.active : labels.inactive}
    </AppBadge>
  );
}

export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <StatusBadge
      active={available}
      labels={{ active: "Available", inactive: "Unavailable" }}
    />
  );
}

export function AccountStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, StatusType> = {
    active: "success",
    inactive: "default",
    suspended: "warning",
  };
  return (
    <AppBadge status={statusMap[status] || "default"}>
      {status}
    </AppBadge>
  );
}

export function TransactionStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, StatusType> = {
    pending: "warning",
    assigned: "assigned",
    processing: "processing",
    awaiting_confirmation: "awaiting_confirmation",
    completed: "success",
    rejected: "error",
    cancelled: "default",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <AppBadge status={statusMap[status] || "default"}>
      {label}
    </AppBadge>
  );
}

export function TransactionTypeBadge({ type }: { type: string }) {
  const isDeposit = type === "deposit";
  return (
    <AppBadge status={isDeposit ? "success" : "purple"}>
      {type}
    </AppBadge>
  );
}

export function TransactionSourceBadge({ source }: { source: string }) {
  return (
    <AppBadge status={source === "dashboard" ? "default" : "indigo"}>
      {source}
    </AppBadge>
  );
}

export default AppBadge;
