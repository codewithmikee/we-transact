"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Key,
  UserCog,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/AppBadge";
import {
  useAgentAccounts,
  useApiKeys,
  useOrg,
  useOrgAdmins,
  usePaymentAgents,
  useTransactionAnalyticsSummary,
} from "./api";

type RangePreset = "today" | "last_7_days" | "custom";

const STATUS_LABELS = {
  pending: "Pending",
  assigned: "Assigned",
  processing: "Processing",
  awaiting_confirmation: "Awaiting Confirmation",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
} as const;

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getPresetRange(preset: Exclude<RangePreset, "custom">) {
  const today = new Date();
  const end = formatDateInput(today);

  if (preset === "today") {
    return {
      dateFrom: end,
      dateTo: end,
    };
  }

  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  return {
    dateFrom: formatDateInput(start),
    dateTo: end,
  };
}

function formatMoney(amount: string) {
  return `ETB ${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function buildTransactionHref(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `/org/transactions?${query}` : "/org/transactions";
}

function AnalyticsCard({
  title,
  value,
  description,
  href,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="group h-full cursor-pointer transition-all hover:border-border/80 hover:shadow-md">
        <CardContent className="flex items-start justify-between gap-4 pt-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-28" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
            <Icon className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MiniStatCard({
  title,
  value,
  href,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value?: number | string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer transition-all hover:border-border/80 hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-14" />
              ) : (
                <p className="mt-2 text-2xl font-bold text-foreground">{value ?? "—"}</p>
              )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-accent">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function OrgDashboardPage() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const defaultRange = getPresetRange("today");
  const [preset, setPreset] = useState<RangePreset>("today");
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const { data: org, isLoading: orgLoading } = useOrg();
  const { data: admins, isLoading: adminsLoading } = useOrgAdmins({ per_page: 1 });
  const { data: agents, isLoading: agentsLoading } = usePaymentAgents({ per_page: 100 });
  const { data: keys, isLoading: keysLoading } = useApiKeys({ per_page: 1 });
  const { data: accounts, isLoading: accountsLoading } = useAgentAccounts(selectedAgentId, !!selectedAgentId);
  const { data: analytics, isLoading: analyticsLoading } = useTransactionAnalyticsSummary({
    date_from: dateFrom,
    date_to: dateTo,
    timezone,
    ...(selectedAgentId ? { agent_id: selectedAgentId } : {}),
    ...(selectedAccountId ? { agent_account_id: selectedAccountId } : {}),
  });

  useEffect(() => {
    setSelectedAccountId("");
  }, [selectedAgentId]);

  const handlePresetChange = (nextPreset: RangePreset) => {
    setPreset(nextPreset);
    if (nextPreset === "custom") return;

    const range = getPresetRange(nextPreset);
    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);
  };

  const requestedStatusHref = (status?: string) =>
    buildTransactionHref({
      date_from: dateFrom,
      date_to: dateTo,
      date_field: "requested_at",
      timezone,
      status,
      agent_id: selectedAgentId || undefined,
      agent_account_id: selectedAccountId || undefined,
    });

  const completedHref = (type?: "deposit" | "withdraw") =>
    buildTransactionHref({
      date_from: dateFrom,
      date_to: dateTo,
      date_field: "completed_at",
      timezone,
      status: "completed",
      type,
      agent_id: selectedAgentId || undefined,
      agent_account_id: selectedAccountId || undefined,
    });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Organization transaction analytics, audit filters, and management snapshot."
        breadcrumbs={[{ label: "Dashboard", isCurrent: true }]}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transaction Analytics Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "today", label: "Today" },
              { id: "last_7_days", label: "Last 7 days" },
              { id: "custom", label: "Custom" },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePresetChange(option.id as RangePreset)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  preset === option.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent",
                ].join(" ")}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setPreset("custom");
                  setDateFrom(event.target.value);
                }}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setPreset("custom");
                  setDateTo(event.target.value);
                }}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Agent</span>
              <select
                value={selectedAgentId}
                onChange={(event) => setSelectedAgentId(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground"
              >
                <option value="">All agents</option>
                {agents?.data.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Account</span>
              <select
                value={selectedAccountId}
                onChange={(event) => setSelectedAccountId(event.target.value)}
                disabled={!selectedAgentId}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {selectedAgentId ? "All selected agent accounts" : "Select an agent first"}
                </option>
                {accounts?.data.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.holder_name} ({account.account_number})
                  </option>
                ))}
              </select>
              {accountsLoading && selectedAgentId ? (
                <span className="text-xs text-muted-foreground">Loading account options...</span>
              ) : null}
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <AnalyticsCard
          title="Completed Deposits"
          value={analytics ? formatMoney(analytics.completed_summary.deposit_amount) : "—"}
          description="Successful deposit amount for the selected completed range."
          href={completedHref("deposit")}
          icon={ArrowDownLeft}
          isLoading={analyticsLoading}
        />
        <AnalyticsCard
          title="Completed Withdraws"
          value={analytics ? formatMoney(analytics.completed_summary.withdraw_amount) : "—"}
          description="Successful withdraw amount for the selected completed range."
          href={completedHref("withdraw")}
          icon={ArrowUpRight}
          isLoading={analyticsLoading}
        />
        <AnalyticsCard
          title="Requested Transactions"
          value={analytics?.requested_summary.total_count ?? "—"}
          description="All transactions requested in the selected request range."
          href={requestedStatusHref()}
          icon={ArrowLeftRight}
          isLoading={analyticsLoading}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <Link
                key={status}
                href={requestedStatusHref(status)}
                className="rounded-xl border border-border bg-muted/20 px-4 py-4 transition-colors hover:bg-accent"
              >
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                {analyticsLoading ? (
                  <Skeleton className="mt-2 h-7 w-14" />
                ) : (
                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {analytics?.requested_summary.by_status[status as keyof typeof STATUS_LABELS] ?? 0}
                  </p>
                )}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
              <p className="text-sm font-medium text-muted-foreground">Requested deposits</p>
              {analyticsLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {analytics?.requested_summary.by_type.deposit ?? 0}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
              <p className="text-sm font-medium text-muted-foreground">Requested withdraws</p>
              {analyticsLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {analytics?.requested_summary.by_type.withdraw ?? 0}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
              <p className="text-sm font-medium text-muted-foreground">Successful transactions</p>
              {analyticsLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {analytics?.completed_summary.total_count ?? 0}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MiniStatCard
          title="Admins"
          value={admins?.meta.total}
          href="/org/admins"
          icon={UserCog}
          isLoading={adminsLoading}
        />
        <MiniStatCard
          title="Agents"
          value={agents?.meta.total}
          href="/org/agents"
          icon={Users}
          isLoading={agentsLoading}
        />
        <MiniStatCard
          title="API Keys"
          value={keys?.meta.total}
          href="/org/integrations"
          icon={Key}
          isLoading={keysLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          {orgLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-5 w-3/4" />
              ))}
            </div>
          ) : org ? (
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-muted-foreground">Name</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{org.name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Slug</dt>
                <dd className="mt-0.5 font-mono text-foreground">{org.slug}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd className="mt-0.5">
                  <StatusBadge active={org.is_active} />
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Callback URL</dt>
                <dd className="mt-0.5 break-all text-foreground">
                  {org.callback_url ?? <span className="text-muted-foreground">Not set</span>}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Created</dt>
                <dd className="mt-0.5 text-foreground">
                  {new Date(org.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Analytics timezone</dt>
                <dd className="mt-0.5 text-foreground">{timezone}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Failed to load organization details.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
