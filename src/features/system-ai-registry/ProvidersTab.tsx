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
import { AiProviderResource, AiProviderDriver } from "@/types/api.types";
import {
  useAiProviders,
  useCreateAiProvider,
  useUpdateAiProvider,
  useDeleteAiProvider,
} from "@/hooks/api/useAiRegistry";

const providerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  driver: z.enum(["openai", "openai_compatible", "anthropic", "gemini", "openrouter"]),
  base_url: z.string().url("Invalid URL").nullable().or(z.literal("")),
  is_active: z.boolean(),
});

type ProviderForm = z.infer<typeof providerSchema>;

const DRIVER_OPTIONS = [
  { value: "openai", label: "OpenAI" },
  { value: "openai_compatible", label: "OpenAI Compatible" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Google Gemini" },
  { value: "openrouter", label: "OpenRouter" },
];

export function ProvidersTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AiProviderResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AiProviderResource | null>(null);

  const { data, isLoading, isError, refetch } = useAiProviders({ page, per_page: 15, search });
  const createMutation = useCreateAiProvider();
  const updateMutation = useUpdateAiProvider();
  const deleteMutation = useDeleteAiProvider();

  const createForm = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: { is_active: true, driver: "openai" },
  });

  const editForm = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
  });

  const handleCreate = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      ...values,
      base_url: values.base_url || null,
    });
    setShowCreate(false);
    createForm.reset();
  });

  const openEdit = (provider: AiProviderResource) => {
    setEditTarget(provider);
    editForm.reset({
      name: provider.name,
      slug: provider.slug,
      driver: provider.driver,
      base_url: provider.base_url ?? "",
      is_active: provider.is_active,
    });
  };

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      id: editTarget.id,
      data: {
        ...values,
        base_url: values.base_url || null,
      },
    });
    setEditTarget(null);
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (provider: AiProviderResource) => {
    updateMutation.mutate({
      id: provider.id,
      data: { is_active: !provider.is_active },
    });
  };

  const columns: Column<AiProviderResource>[] = [
    {
      key: "name",
      header: "Provider",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "driver",
      header: "Driver",
      cell: (row) => (
        <span className="capitalize">{row.driver.replace("_", " ")}</span>
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
      key: "created_at",
      header: "Created",
      cell: (row) => row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
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
          placeholder="Search providers…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No providers yet"
        emptyDescription="Add AI providers to start configuring models."
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create Provider Modal */}
      <AppDialog
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset(); }}
        title="Add AI Provider"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name"
            placeholder="OpenAI"
            error={createForm.formState.errors.name?.message}
            {...createForm.register("name")}
          />
          <Input
            label="Slug"
            placeholder="openai"
            error={createForm.formState.errors.slug?.message}
            {...createForm.register("slug")}
          />
          <Select
            label="Driver"
            options={DRIVER_OPTIONS}
            error={createForm.formState.errors.driver?.message}
            value={createForm.watch("driver")}
            onChange={(v) => createForm.setValue("driver", v as AiProviderDriver)}
          />
          <Input
            label="Base URL (Optional)"
            placeholder="https://api.openai.com/v1"
            error={createForm.formState.errors.base_url?.message}
            {...createForm.register("base_url")}
            description="Required for OpenAI Compatible driver"
          />
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">Active</p>
              <p className="text-xs text-muted-foreground">Provider is available for use</p>
            </div>
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
              {createMutation.isPending ? "Adding…" : "Add Provider"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Edit Provider Modal */}
      <AppDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.name ?? "Provider"}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Name"
            error={editForm.formState.errors.name?.message}
            {...editForm.register("name")}
          />
          <Input
            label="Slug"
            error={editForm.formState.errors.slug?.message}
            {...editForm.register("slug")}
          />
          <Select
            label="Driver"
            options={DRIVER_OPTIONS}
            error={editForm.formState.errors.driver?.message}
            value={editForm.watch("driver")}
            onChange={(v) => editForm.setValue("driver", v as AiProviderDriver)}
          />
          <Input
            label="Base URL (Optional)"
            error={editForm.formState.errors.base_url?.message}
            {...editForm.register("base_url")}
          />
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
        title="Delete Provider"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone and is only allowed if the provider has no models or credentials.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
