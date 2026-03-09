"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, ShieldAlert, ShieldCheck } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import AppDialog from "@/components/ui/AppDialog";
import { Toggle } from "@/components/ui/Toggle";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog"; 
import { AgentAiConfiguration, AiModelResource, AiCredentialResource } from "@/types/api.types";
import {
  useAgentAiConfigs,
  useCreateAgentAiConfig,
  useUpdateAgentAiConfig,
  useDeleteAgentAiConfig,
} from "@/hooks/api/useAgentAiConfigs";
import { useAiModels, useAiCredentials } from "@/hooks/api/useAiRegistry";
import AppBadge from "@/components/ui/AppBadge";

const configSchema = z.object({
  model_id: z.string().uuid("Please select a model"),
  credential_id: z.string().uuid("Please select a credential"),
  priority: z.coerce.number().min(1, "Priority must be at least 1"),
  is_active: z.boolean(),
});

type ConfigForm = z.infer<typeof configSchema>;

export function AgentAiConfigSection({ agentId, organizationUuid }: { agentId: string, organizationUuid?: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<AgentAiConfiguration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AgentAiConfiguration | null>(null);

  const { data: configs, isLoading, isError, refetch } = useAgentAiConfigs(agentId, { organization_uuid: organizationUuid });
  const { data: modelsData } = useAiModels({ per_page: 100, is_active: true });
  const { data: credentialsData } = useAiCredentials({ per_page: 100, is_revoked: false });

  const createMutation = useCreateAgentAiConfig(agentId);
  const updateMutation = useUpdateAgentAiConfig(agentId);
  const deleteMutation = useDeleteAgentAiConfig(agentId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    defaultValues: { is_active: true, priority: 1 },
  });

  const selectedModelId = watch("model_id");
  const selectedModel = modelsData?.data.find(m => m.id === selectedModelId);

  // Filter credentials to match the selected model's provider
  const filteredCredentials = credentialsData?.data.filter(c => 
    !selectedModel || c.provider_id === selectedModel.provider_id
  ) || [];

  const modelOptions = modelsData?.data.map((m) => ({
    value: m.id,
    label: `${m.display_name} (${m.provider?.name})`,
  })) || [];

  const credentialOptions = filteredCredentials.map((c) => ({
    value: c.id,
    label: c.name,
  })) || [];

  const handleCreate = handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    setShowAdd(false);
    reset();
  });

  const handleUpdate = handleSubmit(async (values) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      configId: editTarget.id,
      data: values,
    });
    setEditTarget(null);
    reset();
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const openEdit = (config: AgentAiConfiguration) => {
    setEditTarget(config);
    reset({
      model_id: config.model?.id ?? "",
      credential_id: config.credential?.id ?? "",
      priority: config.priority,
      is_active: config.is_active,
    });
  };

  const handleToggleStatus = (config: AgentAiConfiguration) => {
    updateMutation.mutate({
      configId: config.id,
      data: { is_active: !config.is_active },
    });
  };

  const columns: Column<AgentAiConfiguration>[] = [
    {
      key: "priority",
      header: "Priority",
      className: "w-20",
      cell: (row) => <span className="font-semibold">#{row.priority}</span>,
    },
    {
      key: "model",
      header: "Model",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.model?.display_name}</p>
          <p className="text-xs text-muted-foreground">{row.provider?.name}</p>
        </div>
      ),
    },
    {
      key: "credential",
      header: "Credential",
      cell: (row) => (
        <div>
          <p className="text-sm font-medium">{row.credential?.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{row.credential?.api_key_masked}</p>
        </div>
      ),
    },
    {
      key: "usable",
      header: "Usable",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.is_usable ? (
            <AppBadge status="success">Usable</AppBadge>
          ) : (
            <AppBadge status="error">Broken</AppBadge>
          )}
        </div>
      ),
    },
    {
      key: "active",
      header: "Active",
      cell: (row) => (
        <Toggle
          checked={row.is_active}
          onChange={() => handleToggleStatus(row)}
          disabled={updateMutation.isPending}
        />
      ),
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
        <div>
          <h2 className="text-lg font-bold">AI Configurations</h2>
          <p className="text-xs text-muted-foreground">Ordered list of models and keys assigned to this agent.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Assign AI
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={configs?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No AI configurations"
        emptyDescription="Assign AI models and credentials to enable autonomous features on this device."
      />

      {/* Add/Edit Modal */}
      <AppDialog
        open={showAdd || !!editTarget}
        onClose={() => { setShowAdd(false); setEditTarget(null); reset(); }}
        title={editTarget ? "Edit AI Configuration" : "Assign AI Configuration"}
      >
        <form onSubmit={editTarget ? handleUpdate : handleCreate} className="space-y-4">
          <Select
            label="Model"
            options={modelOptions}
            error={errors.model_id?.message}
            value={watch("model_id")}
            onChange={(v) => {
              setValue("model_id", v);
              setValue("credential_id", ""); // Reset credential when model (provider) changes
            }}
            placeholder="Select a model"
          />
          
          <Select
            label="Credential"
            options={credentialOptions}
            error={errors.credential_id?.message}
            value={watch("credential_id")}
            onChange={(v) => setValue("credential_id", v)}
            placeholder={selectedModelId ? "Select a credential" : "Select a model first"}
            disabled={!selectedModelId}
          />

          <Input
            label="Priority"
            type="number"
            error={errors.priority?.message}
            {...register("priority")}
            description="Lower numbers are tried first."
          />

          <div className="flex items-center justify-between py-1">
            <p className="text-sm font-medium text-foreground">Active</p>
            <Toggle
              checked={watch("is_active")}
              onChange={(v) => setValue("is_active", v)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowAdd(false); setEditTarget(null); reset(); }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving…" : (editTarget ? "Save Changes" : "Assign")}
            </Button>
          </div>
        </form>
      </AppDialog>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove AI Configuration"
        message={`Remove this AI assignment from the agent? This will not delete the underlying model or credential.`}
        confirmLabel="Remove"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
