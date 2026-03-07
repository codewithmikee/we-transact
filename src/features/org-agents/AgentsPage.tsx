"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import AppDialog from "@/components/ui/AppDialog";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import { StatusBadge, AvailabilityBadge, AccountStatusBadge } from "@/components/data/StatusBadge";
import { CopyField } from "@/components/data/CopyButton";
import { PaymentAgentResource, AgentAccountResource } from "@/types/api.types";
import {
  useAgentAccounts,
  useAvailableBanks,
  useCreateAgentAccount,
  useCreatePaymentAgent,
  useDeleteAgentAccount,
  useDeletePaymentAgent,
  useGenerateConnectCode,
  usePaymentAgents,
  useUpdatePaymentAgent,
} from "./api";

// ── Schemas ────────────────────────────────────────────────────────────────────

const agentTypeOptions = [
  { id: "user", name: "User Agent" },
  { id: "device", name: "Device Agent" },
];

const createAgentSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    type: z.enum(["user", "device"]),
    phone_number: z.string().optional(),
    user_name: z.string().optional(),
    device_name: z.string().optional(),
  })
  .refine(
    (d) => {
      if (d.type === "user") return !!d.user_name;
      return true;
    },
    { message: "Username is required for user agents", path: ["user_name"] },
  );

type CreateAgentForm = z.infer<typeof createAgentSchema>;

const createAccountSchema = z.object({
  bank_id: z.string().min(1, "Bank is required"),
  holder_name: z.string().min(2, "Holder name is required"),
  account_number: z.string().min(4, "Account number is required"),
});

type CreateAccountForm = z.infer<typeof createAccountSchema>;

// ── Agent Accounts Sub-panel ───────────────────────────────────────────────────

function AgentAccountsPanel({ agent }: { agent: PaymentAgentResource }) {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentAccountResource | null>(null);

  const { data: accounts, isLoading } = useAgentAccounts(agent.id);
  const { data: banksData } = useAvailableBanks();
  const createAccount = useCreateAgentAccount();
  const deleteAccount = useDeleteAgentAccount();


  const bankOptions =
    banksData?.map((b) => ({ id: b.id, name: `${b.name} (${b.code})` })) ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAccountForm>({ resolver: zodResolver(createAccountSchema) });

  const handleCreateAccount = handleSubmit(async (values) => {
    await createAccount.mutateAsync({ agentUuid: agent.id, data: values });
    setShowAddAccount(false);
    reset();
  });

  const handleDeleteAccount = async () => {
    if (!deleteTarget) return;
    await deleteAccount.mutateAsync({ agentUuid: agent.id, accountUuid: deleteTarget.id });
    setDeleteTarget(null);
  };

  const accountColumns: Column<AgentAccountResource>[] = [
    {
      key: "bank",
      header: "Bank",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.bank.name}</p>
          <p className="text-xs text-slate-400">{row.bank.code}</p>
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
    <div className="bg-slate-50 border-t border-slate-200 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-700">
          Accounts ({accounts?.data.length ?? 0})
        </p>
        <Button variant="outline" onClick={() => setShowAddAccount(true)} className="h-7 text-xs px-2.5">
          <Plus className="h-3 w-3 mr-1" />
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-400 py-2">Loading accounts…</p>
      ) : !accounts?.data.length ? (
        <p className="text-xs text-slate-400 py-2">No accounts linked to this agent.</p>
      ) : (
        <DataTable
          columns={accountColumns}
          data={accounts.data}
          keyExtractor={(r) => r.id}
          skeletonRows={2}
        />
      )}

      {/* Add Account Modal */}
      <AppDialog
        open={showAddAccount}
        onClose={() => { setShowAddAccount(false); reset(); }}
        title="Add Bank Account"
        maxWidth="md"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bank</label>
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
              <p className="text-xs text-red-500 mt-1">{errors.bank_id.message}</p>
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
              onClick={() => { setShowAddAccount(false); reset(); }}
              disabled={createAccount.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createAccount.isPending}>
              {createAccount.isPending ? "Adding…" : "Add Account"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Delete Account Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message={`Delete account "${deleteTarget?.account_number}" from ${deleteTarget?.bank.name}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteAccount.isPending}
      />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentAgentResource | null>(null);
  const [toggleTarget, setToggleTarget] = useState<PaymentAgentResource | null>(null);
  const [connectCodeAgent, setConnectCodeAgent] = useState<PaymentAgentResource | null>(null);
  const [createdAgentSecret, setCreatedAgentSecret] = useState<{
    agent: PaymentAgentResource;
    password?: string;
  } | null>(null);

  const { data, isLoading, isError } = usePaymentAgents({ page, per_page: 15, search });
  const createMutation = useCreatePaymentAgent();
  const updateMutation = useUpdatePaymentAgent();
  const deleteMutation = useDeletePaymentAgent();
  const connectCodeMutation = useGenerateConnectCode();
 

  const [agentType, setAgentType] = useState<{ id: string; name: string }>(agentTypeOptions[0]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: { type: "user" },
  });

  const handleCreate = handleSubmit(async (values) => {
    const agent = await createMutation.mutateAsync(values);
    setShowCreate(false);
    reset();
    if (agent.agent_user_temporary_password) {
      setCreatedAgentSecret({ agent, password: agent.agent_user_temporary_password });
    }
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    await updateMutation.mutateAsync({
      uuid: toggleTarget.id,
      data: { is_active: !toggleTarget.is_active },
    });
    setToggleTarget(null);
  };

  const handleGenerateConnectCode = async (agent: PaymentAgentResource) => {
    const updated = await connectCodeMutation.mutateAsync(agent.id);
    setConnectCodeAgent(updated);
  };

  const columns: Column<PaymentAgentResource>[] = [
    {
      key: "expand",
      header: "",
      className: "w-8",
      cell: (row) => (
        <button
          onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expandedId === row.id ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ),
    },
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant={row.type === "user" ? "info" : "secondary"} className="text-[10px] py-0">
              {row.type}
            </Badge>
            <span className="font-mono text-xs text-slate-400">{row.login_code}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge active={row.is_active} />
          <AvailabilityBadge available={row.is_available} />
        </div>
      ),
    },
    {
      key: "accounts",
      header: "Accounts",
      cell: (row) => (
        <span className="text-slate-600">{row.accounts?.length ?? 0}</span>
      ),
    },
    {
      key: "last_seen",
      header: "Last Seen",
      cell: (row) =>
        row.last_seen ? (
          new Date(row.last_seen).toLocaleString()
        ) : (
          <span className="text-slate-400">Never</span>
        ),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (row) => (
        <ActionMenu
          actions={[
            ...(row.type === "device"
              ? [
                  {
                    label: "Generate Connect Code",
                    icon: RefreshCw,
                    onClick: () => handleGenerateConnectCode(row),
                    disabled: connectCodeMutation.isPending,
                  },
                ]
              : []),
            {
              label: row.is_active ? "Deactivate" : "Activate",
              icon: row.is_active ? ToggleLeft : ToggleRight,
              onClick: () => setToggleTarget(row),
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
    <>
      <PageHeader
        title="Agents"
        description="Manage payment agents and their linked bank accounts."
        breadcrumbs={[
          { label: "Dashboard", href: ".." },
          { label: "Agents", isCurrent: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search agents…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
      </div>

      {/* Table with expandable accounts row */}
      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && !isError && (!data?.data.length) && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                    No agents yet. Add your first agent.
                  </td>
                </tr>
              )}

              {!isLoading &&
                data?.data.map((agent) => (
                  <>
                    <tr
                      key={agent.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-slate-700">
                          {col.cell(agent)}
                        </td>
                      ))}
                    </tr>
                    {expandedId === agent.id && (
                      <tr key={`${agent.id}-accounts`}>
                        <td colSpan={columns.length} className="p-0">
                          <AgentAccountsPanel agent={agent} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create Agent Modal */}
      <AppDialog
        open={showCreate}
        onClose={() => { setShowCreate(false); reset(); setAgentType(agentTypeOptions[0]); }}
        title="Add Agent"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                label="Agent Type"
                options={agentTypeOptions}
                value={agentTypeOptions.find((o) => o.id === field.value) ?? agentTypeOptions[0]}
                onChange={(opt) => {
                  field.onChange(opt.id);
                  setAgentType({ id: String(opt.id), name: opt.name });
                }}
              />
            )}
          />

          <Input label="Agent Name" error={errors.name?.message} {...register("name")} />

          {agentType.id === "user" && (
            <>
              <Input
                label="Username"
                error={errors.user_name?.message}
                {...register("user_name")}
              />
              <Input
                label="Phone Number (optional)"
                type="tel"
                {...register("phone_number")}
              />
            </>
          )}

          {agentType.id === "device" && (
            <Input
              label="Device Name"
              error={errors.device_name?.message}
              {...register("device_name")}
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowCreate(false); reset(); setAgentType(agentTypeOptions[0]); }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create Agent"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Show temporary password after creating user agent */}
      <AppDialog
        open={!!createdAgentSecret}
        onClose={() => setCreatedAgentSecret(null)}
        title="Agent Created"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Copy the temporary password now — it will not be shown again.
          </div>
          {createdAgentSecret?.password && (
            <CopyField value={createdAgentSecret.password} label="Temporary Password" />
          )}
          <p className="text-xs text-slate-500">
            Username: <span className="font-mono font-medium">{createdAgentSecret?.agent.agent_user?.user_name}</span>
          </p>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setCreatedAgentSecret(null)}>
              Done
            </Button>
          </div>
        </div>
      </AppDialog>

      {/* Connect Code Modal */}
      <AppDialog
        open={!!connectCodeAgent}
        onClose={() => setConnectCodeAgent(null)}
        title="Connect Code"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            Share this code with the device to connect it. The code expires soon.
          </div>
          {connectCodeAgent?.connect_code && (
            <CopyField value={connectCodeAgent.connect_code} label="Connect Code" />
          )}
          {connectCodeAgent?.connect_code_expires_at && (
            <p className="text-xs text-slate-500">
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

      {/* Toggle Status Confirm */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={`${toggleTarget?.is_active ? "Deactivate" : "Activate"} Agent`}
        message={`This will ${toggleTarget?.is_active ? "deactivate" : "activate"} agent "${toggleTarget?.name}".`}
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        destructive={toggleTarget?.is_active}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Agent Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Agent"
        message={`Permanently delete agent "${deleteTarget?.name}"? All linked accounts will also be removed.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
