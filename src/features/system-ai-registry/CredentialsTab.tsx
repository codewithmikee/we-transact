"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, FlaskConical, ShieldAlert, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import AppDialog from "@/components/ui/AppDialog";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import { AppBadge } from "@/components/ui/AppBadge";
import { AiCredentialResource } from "@/types/api.types";
import {
  useAiCredentials,
  useCreateAiCredential,
  useUpdateAiCredential,
  useRevokeAiCredential,
  useTestAiCredential,
  useAiProviders,
} from "@/hooks/api/useAiRegistry";

const credentialSchema = z.object({
  provider_id: z.string().uuid("Please select a provider"),
  name: z.string().min(1, "Name is required"),
  api_key: z.string().min(1, "API Key is required").optional(),
});

type CredentialForm = z.infer<typeof credentialSchema>;

export function CredentialsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AiCredentialResource | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AiCredentialResource | null>(null);

  const { data, isLoading, isError, refetch } = useAiCredentials({ page, per_page: 15, search });
  const { data: providersData } = useAiProviders({ per_page: 100 });
  
  const createMutation = useCreateAiCredential();
  const updateMutation = useUpdateAiCredential();
  const revokeMutation = useRevokeAiCredential();
  const testMutation = useTestAiCredential();

  const createForm = useForm<CredentialForm>({
    resolver: zodResolver(credentialSchema),
  });

  const editForm = useForm<CredentialForm>({
    resolver: zodResolver(credentialSchema.extend({
      api_key: z.string().optional(),
    })),
  });

  const providerOptions = providersData?.data.map((p) => ({
    value: p.id,
    label: p.name,
  })) || [];

  const handleCreate = createForm.handleSubmit(async (values) => {
    if (!values.api_key) return;
    await createMutation.mutateAsync({
      provider_id: values.provider_id,
      name: values.name,
      api_key: values.api_key,
    });
    setShowCreate(false);
    createForm.reset();
  });

  const openEdit = (cred: AiCredentialResource) => {
    setEditTarget(cred);
    editForm.reset({
      provider_id: cred.provider_id ?? "",
      name: cred.name,
      api_key: "",
    });
  };

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({
      id: editTarget.id,
      data: {
        provider_id: values.provider_id,
        name: values.name,
        ...(values.api_key ? { api_key: values.api_key } : {}),
      },
    });
    setEditTarget(null);
  });

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    await revokeMutation.mutateAsync(revokeTarget.id);
    setRevokeTarget(null);
  };

  const handleTest = (id: string) => {
    testMutation.mutate(id);
  };

  const columns: Column<AiCredentialResource>[] = [
    {
      key: "name",
      header: "Credential",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.api_key_masked}</p>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      cell: (row) => row.provider?.name || "-",
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        row.is_revoked ? (
          <AppBadge variant="destructive">Revoked</AppBadge>
        ) : (
          <AppBadge variant="success">Active</AppBadge>
        )
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
              label: "Test Connection",
              icon: FlaskConical,
              onClick: () => handleTest(row.id),
              disabled: row.is_revoked || testMutation.isPending,
            },
            {
              label: "Edit",
              icon: Pencil,
              onClick: () => openEdit(row),
            },
            {
              label: "Revoke",
              icon: Trash2,
              onClick: () => setRevokeTarget(row),
              destructive: true,
              disabled: row.is_revoked,
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
          placeholder="Search credentials…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Credential
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No credentials yet"
        emptyDescription="Add API keys for your providers to start using models."
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create Credential Modal */}
      <AppDialog
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset(); }}
        title="Add AI Credential"
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
            label="Name"
            placeholder="Primary Production Key"
            error={createForm.formState.errors.name?.message}
            {...createForm.register("name")}
          />
          <Input
            label="API Key"
            type="password"
            placeholder="sk-..."
            error={createForm.formState.errors.api_key?.message}
            {...createForm.register("api_key")}
          />
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
              {createMutation.isPending ? "Adding…" : "Add Credential"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Edit Credential Modal */}
      <AppDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.name ?? "Credential"}`}
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
            label="Name"
            error={editForm.formState.errors.name?.message}
            {...editForm.register("name")}
          />
          <Input
            label="API Key (Leave empty to keep current)"
            type="password"
            placeholder="sk-..."
            error={editForm.formState.errors.api_key?.message}
            {...editForm.register("api_key")}
          />
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

      {/* Revoke Confirm */}
      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke Credential"
        message={`Revoke "${revokeTarget?.name}"? This credential will no longer be usable, but will remain in the list for audit purposes.`}
        confirmLabel="Revoke"
        destructive
        isLoading={revokeMutation.isPending}
      />
    </>
  );
}
