"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { DataTable, Column } from "@/components/data/DataTable";
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import {
  TransactionStatusBadge,
  TransactionTypeBadge,
  TransactionSourceBadge,
} from "@/components/data/StatusBadge";
import { TransactionListQuery, TransactionResource, TransactionStatus, TransactionType, TransactionSource } from "@/types/api.types";
import { useTransactions } from "@/hooks/api/useTransactions";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAmount(amount: string, currency: string) {
  return `${currency} ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

// ── Filter bar ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: TransactionStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "processing", label: "Processing" },
  { value: "awaiting_confirmation", label: "Awaiting Confirmation" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS: { value: TransactionType | ""; label: string }[] = [
  { value: "", label: "All types" },
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
];

const SOURCE_OPTIONS: { value: TransactionSource | ""; label: string }[] = [
  { value: "", label: "All sources" },
  { value: "dashboard", label: "Dashboard" },
  { value: "platform", label: "Platform" },
];

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: T | "") => void;
  options: { value: T | ""; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T | "")}
      className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [type, setType] = useState<TransactionType | "">("");
  const [source, setSource] = useState<TransactionSource | "">("");

  const params: TransactionListQuery = {
    page,
    per_page: 15,
    ...(search && { search }),
    ...(status && { status }),
    ...(type && { type }),
    ...(source && { source }),
  };

  const { data, isLoading, isError, refetch } = useTransactions(params);

  const hasFilters = !!(search || status || type || source);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setType("");
    setSource("");
    setPage(1);
  };

  const columns: Column<TransactionResource>[] = [
    {
      key: "tracking",
      header: "Tracking / Client",
      cell: (row) => (
        <Link href={`/org/transactions/${row.id}`} className="group block">
          <p className="font-mono text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
            {row.tracking_code}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">
            {row.client_full_name}
          </p>
        </Link>
      ),
    },
    {
      key: "type",
      header: "Type / Source",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <TransactionTypeBadge type={row.type} />
          <TransactionSourceBadge source={row.source} />
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <TransactionStatusBadge status={row.status} />,
    },
    {
      key: "amount",
      header: "Amount",
      cell: (row) => (
        <span className="font-mono text-sm font-semibold text-foreground">
          {formatAmount(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: "bank_agent",
      header: "Bank / Agent",
      cell: (row) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <p className="font-medium text-foreground">{row.bank?.name ?? "—"}</p>
          <p>{row.agent?.name ?? "Unassigned"}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Requested",
      cell: (row) =>
        row.requested_at ? (
          <span className="text-xs text-muted-foreground">
            {new Date(row.requested_at).toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Monitor and manage payment transactions."
        breadcrumbs={[{ label: "Transactions", isCurrent: true }]}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search client, tracking code…"
          className="w-full sm:w-64"
        />
        <FilterSelect value={type} onChange={(v) => { setType(v); setPage(1); }} options={TYPE_OPTIONS} />
        <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={STATUS_OPTIONS} />
        <FilterSelect value={source} onChange={(v) => { setSource(v); setPage(1); }} options={SOURCE_OPTIONS} />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="ml-auto"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No transactions yet"
        emptyDescription={
          hasFilters
            ? "No transactions match your filters."
            : "Transactions will appear here once created via the Integrations page."
        }
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />
    </>
  );
}
