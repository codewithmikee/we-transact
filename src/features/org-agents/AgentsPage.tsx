"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  RefreshCw,
  KeyRound,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AppBadge from "@/components/ui/AppBadge";
import AppDialog from "@/components/ui/AppDialog";
import { Select } from "@/components/ui/Select";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import { StatusBadge, AvailabilityBadge } from "@/components/ui/AppBadge";
import { CopyField } from "@/components/data/CopyButton";
import { AgentAutomationMode, AgentType, PaymentAgentResource } from "@/types/api.types";
import { selectUserRole, useSessionStore } from "@/stores/session.store";
import {
  useCreatePaymentAgent,
  useDeletePaymentAgent,
  useGenerateConnectCode,
  usePaymentAgents,
  useResetAgentPassword,
  useUpdatePaymentAgent,
} from "./api";

// ── Schemas ────────────────────────────────────────────────────────────────────

type AgentCreationMode = "user" | AgentAutomationMode;

type AgentModeOption = {
  id: AgentCreationMode;
  name: string;
  type: AgentType;
  automationMode: AgentAutomationMode | null;
};

const agentModeOptions: AgentModeOption[] = [
  { id: "user", name: "User Agent", type: "user", automationMode: null },
  { id: "full_automated", name: "Fully Automated", type: "device", automationMode: "full_automated" },
  { id: "sim_automated", name: "SIM Automated", type: "device", automationMode: "sim_automated" },
];

const getAgentDisplayLabel = (type: AgentType, automationMode?: AgentAutomationMode | null): string => {
  if (type === "user") return "User Agent";
  if (automationMode === "full_automated") return "Fully Automated";
  if (automationMode === "sim_automated") return "SIM Automated";
  return "Device Agent";
};

const createAgentSchema = z
  .object({
    agent_mode: z.enum(["user", "full_automated", "sim_automated"]),
    name: z.string().min(2, "Name is required"),
    phone_number: z.string().optional(),
    user_name: z.string().optional(),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    device_name: z.string().optional(),
  })
  .refine(
    (d) => {
      if (d.agent_mode === "user") return !!d.user_name;
      return true;
    },
    { message: "Username is required for user agents", path: ["user_name"] },
  )
  .refine(
    (d) => {
      if (d.agent_mode === "user") return !!d.password && d.password.length >= 8;
      return true;
    },
    { message: "Password must be at least 8 characters", path: ["password"] },
  )
  .refine(
    (d) => {
      if (d.agent_mode === "user") return d.password === d.password_confirmation;
      return true;
    },
    { message: "Passwords do not match", path: ["password_confirmation"] },
  );

type CreateAgentForm = z.infer<typeof createAgentSchema>;

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string().min(8, "Password confirmation is required"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentAgentResource | null>(null);
  const [toggleTarget, setToggleTarget] = useState<PaymentAgentResource | null>(null);
  const [passwordResetTarget, setPasswordResetTarget] = useState<PaymentAgentResource | null>(null);
  const [connectCodeAgent, setConnectCodeAgent] = useState<PaymentAgentResource | null>(null);

  const { data, isLoading, isError, refetch } = usePaymentAgents({ page, per_page: 15, search });
  const createMutation = useCreatePaymentAgent();
  const updateMutation = useUpdatePaymentAgent();
  const deleteMutation = useDeletePaymentAgent();
  const connectCodeMutation = useGenerateConnectCode();
  const resetPasswordMutation = useResetAgentPassword();
  const userRole = useSessionStore(selectUserRole);
  const canResetPasswords = userRole === "sy_super_admin" || userRole === "org_super_admin";
 

  const [agentMode, setAgentMode] = useState<AgentModeOption>(agentModeOptions[0]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateAgentForm>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: { agent_mode: agentModeOptions[0].id },
  });

  const {
    register: registerResetPassword,
    handleSubmit: handleResetPasswordSubmit,
    reset: resetResetPasswordForm,
    formState: { errors: resetPasswordErrors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleCreate = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      name: values.name,
      type: agentMode.type,
      automation_mode: agentMode.automationMode ?? undefined,
      phone_number: values.phone_number || undefined,
      user_name: values.user_name,
      password: values.password,
      password_confirmation: values.password_confirmation,
      device_name: agentMode.type === "device" ? values.device_name || undefined : undefined,
    });
    setShowCreate(false);
    reset();
    setAgentMode(agentModeOptions[0]);
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
    const connectCodePayload = await connectCodeMutation.mutateAsync(agent.id);
    setConnectCodeAgent({
      ...agent,
      connect_code: connectCodePayload.connect_code,
      connect_code_expires_at: connectCodePayload.connect_code_expires_at,
    });
  };

  const handleResetPassword = handleResetPasswordSubmit(async (values) => {
    if (!passwordResetTarget) return;
    await resetPasswordMutation.mutateAsync({
      uuid: passwordResetTarget.id,
      data: values,
    });
    setPasswordResetTarget(null);
    resetResetPasswordForm();
  });

  const columns: Column<PaymentAgentResource>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <Link
          href={`/org/agents/${row.id}`}
          className="group block"
        >
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <AppBadge status={row.type === "user" ? "info" : "default"} className="text-[10px] py-0">
              {getAgentDisplayLabel(row.type, row.automation_mode ?? null)}
            </AppBadge>
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
            ...(row.type === "user" && canResetPasswords
              ? [
                  {
                    label: "Reset Password",
                    icon: KeyRound,
                    onClick: () => setPasswordResetTarget(row),
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
          { label: "Dashboard", href: "/org" },
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
        onClose={() => { setShowCreate(false); reset(); setAgentMode(agentModeOptions[0]); }}
        title="Add Agent"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Controller
            control={control}
            name="agent_mode"
            render={({ field }) => (
              <Select
                label="Agent Type"
                options={agentModeOptions}
                value={agentModeOptions.find((o) => o.id === field.value) ?? agentModeOptions[0]}
                onChange={(opt) => {
                  const selected = agentModeOptions.find((entry) => entry.id === opt.id) ?? agentModeOptions[0];
                  field.onChange(selected.id);
                  setAgentMode(selected);
                }}
                error={errors.agent_mode?.message}
              />
            )}
          />

          <Input label="Agent Name" error={errors.name?.message} {...register("name")} />

          {agentMode.id === "user" && (
            <>
              <Input
                label="Username"
                error={errors.user_name?.message}
                autoComplete="username"
                {...register("user_name")}
              />
              <Input
                label="Phone Number (optional)"
                type="tel"
                {...register("phone_number")}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
              <Input
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                error={errors.password_confirmation?.message}
                {...register("password_confirmation")}
              />
            </>
          )}

          {agentMode.type === "device" && (
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
              onClick={() => { setShowCreate(false); reset(); setAgentMode(agentModeOptions[0]); }}
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

      <AppDialog
        open={!!passwordResetTarget}
        onClose={() => { setPasswordResetTarget(null); resetResetPasswordForm(); }}
        title="Reset Agent Password"
        maxWidth="sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-600 dark:text-blue-400">
            Set a new password for <span className="font-medium">{passwordResetTarget?.name}</span>.
          </div>
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={resetPasswordErrors.password?.message}
            {...registerResetPassword("password")}
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            error={resetPasswordErrors.password_confirmation?.message}
            {...registerResetPassword("password_confirmation")}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setPasswordResetTarget(null); resetResetPasswordForm(); }}
              disabled={resetPasswordMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? "Resetting…" : "Reset Password"}
            </Button>
          </div>
        </form>
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
