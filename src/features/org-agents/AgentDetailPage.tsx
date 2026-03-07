"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Loader2,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import AppDialog from "@/components/ui/AppDialog";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { StatusBadge, AvailabilityBadge, AccountStatusBadge } from "@/components/data/StatusBadge";
import { CopyField } from "@/components/data/CopyButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { AgentAccountResource, PaymentAgentResource } from "@/types/api.types";
import {
  useAgentAccounts,
  useAvailableBanks,
  useCreateAgentAccount,
  useDeleteAgentAccount,
  useGenerateConnectCode,
  usePaymentAgent,
  useUpdatePaymentAgent,
  useUpdateAgentAccount,
} from "./api";

// ── Schemas ────────────────────────────────────────────────────────────────────

const accountSchema = z.object({
  bank_id: z.string().min(1, "Bank is required"),
  holder_name: z.string().min(2, "Holder name is required"),
  account_number: z.string().min(4, "Account number is required"),
});

type AccountForm = z.infer<typeof accountSchema>;

// ── Agent Accounts Section ────────────────────────────────────────────────────

function AgentAccountsSection({ agentUuid }: { agentUuid: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<AgentAccountResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgentAccountResource | null>(null);

  const { data: accounts, isLoading, refetch } = useAgentAccounts(agentUuid);
  const { data: banksData } = useAvailableBanks();
  const createAccount = useCreateAgentAccount();
  const updateAccount = useUpdateAgentAccount();
  const deleteAccount = useDeleteAgentAccount();

  const bankOptions =
    banksData?.map((b) => ({ id: b.id, name: `${b.name} (${b.code})` })) ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AccountForm>({ resolver: zodResolver(accountSchema) });

  const handleCreate = handleSubmit(async (values) => {
    await createAccount.mutateAsync({ agentUuid, data: values });
    setShowAdd(false);
    reset();
  });

  const handleUpdate = handleSubmit(async (values) => {
    if (!editTarget) return;
    await updateAccount.mutateAsync({ 
      agentUuid, 
      accountUuid: editTarget.id, 
      data: values 
    });
    setEditTarget(null);
    reset();
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAccount.mutateAsync({ agentUuid, accountUuid: deleteTarget.id });
    setDeleteTarget(null);
  };

  const openEdit = (account: AgentAccountResource) => {
    setEditTarget(account);
    reset({
      bank_id: account.bank.id,
      holder_name: account.holder_name,
      account_number: account.account_number,
    });
  };

  const columns: Column<AgentAccountResource>[] = [
    {
      key: "bank",
      header: "Bank",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.bank.name}</p>
          <p className="text-xs text-muted-foreground">{row.bank.code}</p>
        </div>
      ),
    },
    {
      key: "holder",
      header: "Holder",
      cell: (row) => row.holder_name,
    },
    {
      key: "account_number",
      header: "Account No.",
      cell: (row) => <span className="font-mono text-sm">{row.account_number}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <AccountStatusBadge status={row.status} />,
    },
    {
      key: "active",
      header: "Active",
      cell: (row) => <StatusBadge active={row.is_active} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (row) => (
        <ActionMenu
          actions={[
            {
              label: "Edit",
              icon: Pencil,
              onClick: () => openEdit(row),
            },
            {
              label: "Delete",
              icon: Trash2,
              onClick: () => setDeleteTarget(row),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Bank Accounts</h2>
        <Button variant="primary" onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={accounts?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        onRetry={refetch}
        emptyTitle="No accounts linked"
        emptyDescription="Add a bank account to start receiving payments through this agent."
      />

      {/* Add/Edit Modal */}
      <AppDialog
        open={showAdd || !!editTarget}
        onClose={() => { setShowAdd(false); setEditTarget(null); reset(); }}
        title={editTarget ? "Edit Account" : "Add Bank Account"}
      >
        <form onSubmit={editTarget ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Bank</label>
            <Controller
              control={control}
              name="bank_id"
              render={({ field }) => (
                <Select
                  options={bankOptions}
                  value={bankOptions.find((b) => b.id === field.value) ?? { id: "", name: "Select bank…" }}
                  onChange={(opt) => field.onChange(opt.id)}
                />
              )}
            />
            {errors.bank_id && (
              <p className="text-xs text-destructive mt-1">{errors.bank_id.message}</p>
            )}
          </div>
          <Input
            label="Account Holder Name"
            error={errors.holder_name?.message}
            {...register("holder_name")}
          />
          <Input
            label="Account Number"
            error={errors.account_number?.message}
            {...register("account_number")}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowAdd(false); setEditTarget(null); reset(); }}
              disabled={createAccount.isPending || updateAccount.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createAccount.isPending || updateAccount.isPending}>
              {createAccount.isPending || updateAccount.isPending ? "Saving…" : (editTarget ? "Save Changes" : "Add Account")}
            </Button>
          </div>
        </form>
      </AppDialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Account"
        message={`Permanently delete this account? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteAccount.isPending}
      />
    </div>
  );
}

// ── Detail Page ───────────────────────────────────────────────────────────────

export default function AgentDetailPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const router = useRouter();

  const { data: agent, isPending, isError } = usePaymentAgent(agentId);
  const updateMutation = useUpdatePaymentAgent();
  const connectCodeMutation = useGenerateConnectCode();
  const [connectCodeAgent, setConnectCodeAgent] = useState<PaymentAgentResource | null>(null);

  const handleToggle = async () => {
    if (!agent) return;
    await updateMutation.mutateAsync({
      uuid: agent.id,
      data: { is_active: !agent.is_active },
    });
  };

  const handleGenerateConnectCode = async () => {
    if (!agent) return;
    const connectCodePayload = await connectCodeMutation.mutateAsync(agent.id);
    setConnectCodeAgent({
      ...agent,
      connect_code: connectCodePayload.connect_code,
      connect_code_expires_at: connectCodePayload.connect_code_expires_at,
    });
  };

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 col-span-1" />
          <Skeleton className="h-40 col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Agent not found or an error occurred.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/org/agents"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Agents
        </Link>
      </div>

      <PageHeader
        title={agent.name}
        description={`Manage agent details and bank accounts.`}
        breadcrumbs={[
          { label: "Dashboard", href: "/org" },
          { label: "Agents", href: "/org/agents" },
          { label: agent.name, isCurrent: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agent Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agent Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Status</span>
                <StatusBadge active={agent.is_active} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Availability</span>
                <AvailabilityBadge available={agent.is_available} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant={agent.type === "user" ? "info" : "secondary"}>
                  {agent.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Login Code</span>
                <span className="font-mono text-sm font-semibold">{agent.login_code}</span>
              </div>
              
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleToggle}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : agent.is_active ? (
                    <ToggleLeft className="h-4 w-4 mr-2" />
                  ) : (
                    <ToggleRight className="h-4 w-4 mr-2" />
                  )}
                  {agent.is_active ? "Deactivate Agent" : "Activate Agent"}
                </Button>

                {agent.type === "device" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={handleGenerateConnectCode}
                    disabled={connectCodeMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Connect Code
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {agent.last_seen ? (
                  new Date(agent.last_seen).toLocaleString()
                ) : (
                  <span className="text-muted-foreground">Never seen online</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Accounts Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <AgentAccountsSection agentUuid={agent.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connect Code Modal */}
      <AppDialog
        open={!!connectCodeAgent}
        onClose={() => setConnectCodeAgent(null)}
        title="Connect Code"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-600 dark:text-blue-400">
            Share this code with the device to connect it. The code expires soon.
          </div>
          {connectCodeAgent?.connect_code && (
            <CopyField value={connectCodeAgent.connect_code} label="Connect Code" />
          )}
          {connectCodeAgent?.connect_code_expires_at && (
            <p className="text-xs text-muted-foreground">
              Expires: {new Date(connectCodeAgent.connect_code_expires_at).toLocaleString()}
            </p>
          )}
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setConnectCodeAgent(null)}>
              Done
            </Button>
          </div>
        </div>
      </AppDialog>
    </>
  );
}
