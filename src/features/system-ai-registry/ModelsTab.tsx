"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import { AiModelResource } from "@/types/api.types";
import {
  useAiModels,
  useCreateAiModel,
  useUpdateAiModel,
  useDeleteAiModel,
  useAiProviders,
} from "@/hooks/api/useAiRegistry";

const modelSchema = z.object({
  provider_id: z.string().uuid("Please select a provider"),
  model_key: z.string().min(1, "Model key is required"),
  display_name: z.string().min(1, "Display name is required"),
  input_price_per_million: z.coerce.number().min(0),
  output_price_per_million: z.coerce.number().min(0),
  is_active: z.boolean().default(true),
});

type ModelForm = z.infer<typeof modelSchema>;

export function ModelsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AiModelResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AiModelResource | null>(null);

  const { data, isLoading, isError, refetch } = useAiModels({ page, per_page: 15, search });
  const { data: providersData } = useAiProviders({ per_page: 100 });
  
  const createMutation = useCreateAiModel();
  const updateMutation = useUpdateAiModel();
  const deleteMutation = useDeleteAiModel();

  const createForm = useForm<ModelForm>({
    resolver: zodResolver(modelSchema),
    defaultValues: { is_active: true },
  });

  const editForm = useForm<ModelForm>({
    resolver: zodResolver(modelSchema),
  });

  const providerOptions = providersData?.data.map((p) => ({
    value: p.id,
    label: p.name,
  })) || [];

  const handleCreate = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    setShowCreate(false);
    createForm.reset();
  });

  const openEdit = (model: AiModelResource) => {
    setEditTarget(model);
    editForm.reset({
      provider_id: model.provider_id ?? "",
      model_key: model.model_key,
      display_name: model.display_name,
      input_price_per_million: Number(model.input_price_per_million),
      output_price_per_million: Number(model.output_price_per_million),
      is_active: model.is_active,
    });
  };

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      id: editTarget.id,
      data: values,
    });
    setEditTarget(null);
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (model: AiModelResource) => {
    updateMutation.mutate({
      id: model.id,
      data: { is_active: !model.is_active },
    });
  };

  const columns: Column<AiModelResource>[] = [
    {
      key: "display_name",
      header: "Model",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.display_name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.model_key}</p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      cell: (row) => row.provider?.name || "-",
    },
    {
      key: "pricing",
      header: "Price (per 1M tokens)",
      cell: (row) => (
        <div className="text-xs">
          <p>In: ${row.input_price_per_million}</p>
          <p>Out: ${row.output_price_per_million}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
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
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search models…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No models yet"
        emptyDescription="Add models to your AI providers."
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create Model Modal */}
      <AppDialog
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset(); }}
        title="Add AI Model"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Provider"
            options={providerOptions}
            error={createForm.formState.errors.provider_id?.message}
            value={createForm.watch("provider_id")}
            onChange={(v) => createForm.setValue("provider_id", v)}
            placeholder="Select a provider"
          />
          <Input
            label="Display Name"
            placeholder="GPT-4o"
            error={createForm.formState.errors.display_name?.message}
            {...createForm.register("display_name")}
          />
          <Input
            label="Model Key"
            placeholder="gpt-4o"
            error={createForm.formState.errors.model_key?.message}
            {...createForm.register("model_key")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Input Price (per 1M)"
              type="number"
              step="0.000001"
              placeholder="0.50"
              error={createForm.formState.errors.input_price_per_million?.message}
              {...createForm.register("input_price_per_million")}
            />
            <Input
              label="Output Price (per 1M)"
              type="number"
              step="0.000001"
              placeholder="1.50"
              error={createForm.formState.errors.output_price_per_million?.message}
              {...createForm.register("output_price_per_million")}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <p className="text-sm font-medium text-foreground">Active</p>
            <Toggle
              checked={createForm.watch("is_active")}
              onChange={(v) => createForm.setValue("is_active", v)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowCreate(false); createForm.reset(); }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding…" : "Add Model"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Edit Model Modal */}
      <AppDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.display_name ?? "Model"}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Select
            label="Provider"
            options={providerOptions}
            error={editForm.formState.errors.provider_id?.message}
            value={editForm.watch("provider_id")}
            onChange={(v) => editForm.setValue("provider_id", v)}
          />
          <Input
            label="Display Name"
            error={editForm.formState.errors.display_name?.message}
            {...editForm.register("display_name")}
          />
          <Input
            label="Model Key"
            error={editForm.formState.errors.model_key?.message}
            {...editForm.register("model_key")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Input Price (per 1M)"
              type="number"
              step="0.000001"
              error={editForm.formState.errors.input_price_per_million?.message}
              {...editForm.register("input_price_per_million")}
            />
            <Input
              label="Output Price (per 1M)"
              type="number"
              step="0.000001"
              error={editForm.formState.errors.output_price_per_million?.message}
              {...editForm.register("output_price_per_million")}
            />
          </div>
          <div className="flex items-center justify-between py-1">
            <p className="text-sm font-medium text-foreground">Active</p>
            <Toggle
              checked={editForm.watch("is_active")}
              onChange={(v) => editForm.setValue("is_active", v)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Model"
        message={`Delete "${deleteTarget?.display_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
