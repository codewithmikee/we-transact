"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
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
import { StatusBadge, AvailabilityBadge } from "@/components/data/StatusBadge";
import { CopyField } from "@/components/data/CopyButton";
import { PaymentAgentResource } from "@/types/api.types";
import {
  useCreatePaymentAgent,
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

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentAgentResource | null>(null);
  const [toggleTarget, setToggleTarget] = useState<PaymentAgentResource | null>(null);
  const [connectCodeAgent, setConnectCodeAgent] = useState<PaymentAgentResource | null>(null);
  const [createdAgentSecret, setCreatedAgentSecret] = useState<{
    agent: PaymentAgentResource;
    password?: string;
  } | null>(null);

  const { data, isLoading, isError, refetch } = usePaymentAgents({ page, per_page: 15, search });
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
      key: "name",
      header: "Name",
      cell: (row) => (
        <Link
          href={`/org/${slug}/agents/${row.id}`}
          className="group block"
        >
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant={row.type === "user" ? "info" : "secondary"} className="text-[10px] py-0">
              {row.type}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">{row.login_code}</span>
          </div>
        </Link>
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
      key: "last_seen",
      header: "Last Seen",
      cell: (row) =>
        row.last_seen ? (
          new Date(row.last_seen).toLocaleString()
        ) : (
          <span className="text-muted-foreground">Never</span>
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
          { label: "Dashboard", href: `/org/${slug}` },
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

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No agents yet"
        emptyDescription="Add your first agent to start accepting payments."
        emptyAction={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Agent
          </Button>
        }
      />

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
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-600 dark:text-amber-400">
            Copy the temporary password now — it will not be shown again.
          </div>
          {createdAgentSecret?.password && (
            <CopyField value={createdAgentSecret.password} label="Temporary Password" />
          )}
          <p className="text-xs text-muted-foreground">
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
