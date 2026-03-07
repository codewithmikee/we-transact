"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import AppDialog from "@/components/ui/AppDialog";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import {
  TransactionStatusBadge,
  TransactionTypeBadge,
  TransactionSourceBadge,
} from "@/components/data/StatusBadge";
import {
  useTransaction,
  useTransactionEvents,
  useAssignTransaction,
  useReassignTransaction,
  useRejectTransaction,
  useCompleteTransaction,
} from "@/hooks/api/useTransactions";
import { usePaymentAgents } from "@/hooks/api/usePaymentAgents";
import { useAgentAccounts } from "@/hooks/api/usePaymentAgents";
import { TransactionResource, TransactionStatus } from "@/types/api.types";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TERMINAL_STATUSES: TransactionStatus[] = ["completed", "rejected", "cancelled"];
const isTerminal = (s: TransactionStatus) => TERMINAL_STATUSES.includes(s);

function formatAmount(amount: string, currency: string) {
  return `${currency} ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

// ── Assign / Reassign form ────────────────────────────────────────────────────

const assignSchema = z.object({
  agent_id: z.string().min(1, "Select an agent"),
  agent_account_id: z.string().min(1, "Select an account"),
  notes: z.string().optional(),
});
type AssignForm = z.infer<typeof assignSchema>;

function AssignDialog({
  transactionId,
  mode,
  open,
  onClose,
}: {
  transactionId: string;
  mode: "assign" | "reassign";
  open: boolean;
  onClose: () => void;
}) {
  const assignMutation = useAssignTransaction();
  const reassignMutation = useReassignTransaction();
  const mutation = mode === "assign" ? assignMutation : reassignMutation;

  const { data: agentsData } = usePaymentAgents({ per_page: 100 });
  const agents = agentsData?.data ?? [];

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AssignForm>({
    resolver: zodResolver(assignSchema),
  });

  const selectedAgentId = watch("agent_id");
  const { data: accountsData } = useAgentAccounts(selectedAgentId, !!selectedAgentId);
  const accounts = accountsData?.data ?? [];

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({
      uuid: transactionId,
      data: { agent_account_id: values.agent_account_id, notes: values.notes || undefined },
    });
    reset();
    onClose();
  });

  return (
    <AppDialog
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={mode === "assign" ? "Assign Transaction" : "Reassign Transaction"}
      maxWidth="sm"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Agent</label>
          <select
            {...register("agent_id")}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select agent…</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          {errors.agent_id && <p className="text-xs text-destructive mt-1">{errors.agent_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Account</label>
          <select
            {...register("agent_account_id")}
            disabled={!selectedAgentId || accounts.length === 0}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            <option value="">
              {!selectedAgentId ? "Select agent first…" : accounts.length === 0 ? "No accounts" : "Select account…"}
            </option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.holder_name} — {a.account_number}
              </option>
            ))}
          </select>
          {errors.agent_account_id && <p className="text-xs text-destructive mt-1">{errors.agent_account_id.message}</p>}
        </div>

        <Input label="Notes (optional)" placeholder="Optional assignment note" {...register("notes")} />

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : mode === "assign" ? "Assign" : "Reassign"}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}

// ── Reject form ───────────────────────────────────────────────────────────────

const rejectSchema = z.object({
  rejection_reason: z.string().min(5, "Please provide a reason (min 5 chars)"),
  notes: z.string().optional(),
});
type RejectForm = z.infer<typeof rejectSchema>;

function RejectDialog({
  transactionId,
  open,
  onClose,
}: {
  transactionId: string;
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useRejectTransaction();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RejectForm>({
    resolver: zodResolver(rejectSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({ uuid: transactionId, data: values });
    reset();
    onClose();
  });

  return (
    <AppDialog open={open} onClose={() => { reset(); onClose(); }} title="Reject Transaction" maxWidth="sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>This action is audited and cannot be undone.</span>
        </div>
        <Input
          label="Rejection Reason"
          placeholder="Reason for rejection…"
          error={errors.rejection_reason?.message}
          {...register("rejection_reason")}
        />
        <Input label="Notes (optional)" placeholder="Internal admin note" {...register("notes")} />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" disabled={mutation.isPending}>
            {mutation.isPending ? "Rejecting…" : "Reject Transaction"}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}

// ── Complete form ─────────────────────────────────────────────────────────────

function CompleteDialog({
  transactionId,
  open,
  onClose,
}: {
  transactionId: string;
  open: boolean;
  onClose: () => void;
}) {
  const mutation = useCompleteTransaction();
  const { register, handleSubmit, reset } = useForm<{ external_reference?: string; notes?: string }>();

  const onSubmit = handleSubmit(async (values) => {
    await mutation.mutateAsync({ uuid: transactionId, data: values });
    reset();
    onClose();
  });

  return (
    <AppDialog open={open} onClose={() => { reset(); onClose(); }} title="Complete Transaction" maxWidth="sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="External Reference (optional)" placeholder="Bank ref / receipt ID" {...register("external_reference")} />
        <Input label="Notes (optional)" placeholder="Optional admin note" {...register("notes")} />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Completing…" : "Mark as Complete"}
          </Button>
        </div>
      </form>
    </AppDialog>
  );
}

// ── Event log ─────────────────────────────────────────────────────────────────

function EventLog({ transactionId }: { transactionId: string }) {
  const { data, isLoading } = useTransactionEvents(transactionId);
  const events = data?.data ?? [];

  const EVENT_COLORS: Record<string, string> = {
    created: "bg-muted",
    assigned: "bg-blue-500/20",
    manual_reassign: "bg-amber-500/20",
    started: "bg-indigo-500/20",
    platform_confirmed: "bg-cyan-500/20",
    agent_confirmed: "bg-primary/20",
    completed: "bg-primary/30",
    rejected: "bg-destructive/20",
    cancelled: "bg-muted",
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No events recorded yet.</p>;
  }

  return (
    <ol className="relative border-l border-border ml-2 space-y-4">
      {events.map((event) => (
        <li key={event.id} className="ml-4">
          <span
            className={cn(
              "absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-background",
              EVENT_COLORS[event.event_type] ?? "bg-muted",
            )}
          />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground capitalize">
                {event.event_type.replace(/_/g, " ")}
              </p>
              {event.notes && (
                <p className="text-xs text-muted-foreground mt-0.5">{event.notes}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                by <span className="capitalize">{event.actor_type}</span>
              </p>
            </div>
            <time className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(event.created_at).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TransactionDetailPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const router = useRouter();

  const { data: transaction, isPending, isError } = useTransaction(transactionId);

  const [showAssign, setShowAssign] = useState<"assign" | "reassign" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Transaction not found or an error occurred.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const terminal = isTerminal(transaction.status);
  const canAssign = transaction.status === "pending";
  const canReassign = transaction.status === "assigned";
  const canReject = !terminal;
  const canComplete = transaction.status === "assigned" || transaction.status === "processing" || transaction.status === "awaiting_confirmation";

  return (
    <>
      <div className="mb-6">
        <Link
          href="/org/transactions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </Link>
      </div>

      <PageHeader
        title={transaction.tracking_code}
        description="Transaction details and audit log."
        breadcrumbs={[
          { label: "Transactions", href: "/org/transactions" },
          { label: transaction.tracking_code, isCurrent: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status + amount header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <TransactionStatusBadge status={transaction.status} />
                <TransactionTypeBadge type={transaction.type} />
                <TransactionSourceBadge source={transaction.source} />
                <span className="ml-auto font-mono text-2xl font-bold text-foreground">
                  {formatAmount(transaction.amount, transaction.currency)}
                </span>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <DetailRow label="Bank" value={transaction.bank?.name} />
                <DetailRow
                  label="Agent"
                  value={transaction.agent?.name ?? (
                    <Badge variant="secondary" className="text-xs">Unassigned</Badge>
                  )}
                />
                <DetailRow
                  label="Agent Account"
                  value={
                    transaction.agent_account
                      ? `${transaction.agent_account.holder_name} — ${transaction.agent_account.account_number}`
                      : undefined
                  }
                />
                <DetailRow label="Client Reference" value={transaction.client_reference} />
                <DetailRow label="External Reference" value={transaction.external_reference} />
                {transaction.rejection_reason && (
                  <DetailRow
                    label="Rejection Reason"
                    value={
                      <span className="text-destructive">{transaction.rejection_reason}</span>
                    }
                  />
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader><CardTitle className="text-base">Client</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailRow label="Full Name" value={transaction.client_full_name} />
                <DetailRow label="Phone" value={transaction.client_phone_number} />
                <DetailRow label="Account Holder" value={transaction.client_account_holder_name} />
                <DetailRow label="Account Number" value={
                  transaction.client_account_number
                    ? <span className="font-mono">{transaction.client_account_number}</span>
                    : undefined
                } />
              </dl>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader><CardTitle className="text-base">Timestamps</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <DetailRow label="Requested" value={transaction.requested_at ? new Date(transaction.requested_at).toLocaleString() : undefined} />
                <DetailRow label="Assigned" value={transaction.assigned_at ? new Date(transaction.assigned_at).toLocaleString() : undefined} />
                <DetailRow label="Completed" value={transaction.completed_at ? new Date(transaction.completed_at).toLocaleString() : undefined} />
                <DetailRow label="Rejected" value={transaction.rejected_at ? new Date(transaction.rejected_at).toLocaleString() : undefined} />
                <DetailRow label="Cancelled" value={transaction.cancelled_at ? new Date(transaction.cancelled_at).toLocaleString() : undefined} />
                <DetailRow label="Created By" value={transaction.created_by?.name} />
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right: actions + event log */}
        <div className="space-y-6">
          {/* Actions */}
          {!terminal && (
            <Card>
              <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {canAssign && (
                  <Button
                    variant="primary"
                    className="w-full justify-start"
                    onClick={() => setShowAssign("assign")}
                  >
                    Assign to Agent
                  </Button>
                )}
                {canReassign && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowAssign("reassign")}
                  >
                    Reassign Agent
                  </Button>
                )}
                {canComplete && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowComplete(true)}
                  >
                    Mark as Complete
                  </Button>
                )}
                {canReject && (
                  <Button
                    variant="danger"
                    className="w-full justify-start"
                    onClick={() => setShowReject(true)}
                  >
                    Reject
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Event log */}
          <Card>
            <CardHeader><CardTitle className="text-base">Audit Log</CardTitle></CardHeader>
            <CardContent>
              <EventLog transactionId={transactionId} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      {showAssign && (
        <AssignDialog
          transactionId={transactionId}
          mode={showAssign}
          open={!!showAssign}
          onClose={() => setShowAssign(null)}
        />
      )}
      <RejectDialog
        transactionId={transactionId}
        open={showReject}
        onClose={() => setShowReject(false)}
      />
      <CompleteDialog
        transactionId={transactionId}
        open={showComplete}
        onClose={() => setShowComplete(false)}
      />
    </>
  );
}
