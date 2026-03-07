"use client";

import { useState } from "react";
import { Plus, RotateCw, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import AppDialog from "@/components/ui/AppDialog";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import { CopyField } from "@/components/data/CopyButton";
import { ApiKeyResource } from "@/types/api.types";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useUpdateApiKey,
} from "./api";

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  expires_at: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

function ApiKeyStatusBadge({ apiKey }: { apiKey: ApiKeyResource }) {
  if (apiKey.is_revoked) return <Badge variant="destructive">Revoked</Badge>;
  if (apiKey.is_expired) return <Badge variant="warning">Expired</Badge>;
  return <Badge variant="success">Active</Badge>;
}

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyResource | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyResource | null>(null);
  const [rotateTarget, setRotateTarget] = useState<ApiKeyResource | null>(null);

  const { data, isLoading, isError, refetch } = useApiKeys({ page, per_page: 15, search });
  const createMutation = useCreateApiKey();
  const updateMutation = useUpdateApiKey();
  const revokeMutation = useRevokeApiKey();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const handleCreate = handleSubmit(async (values) => {
    const key = await createMutation.mutateAsync({
      name: values.name,
      expires_at: values.expires_at || null,
    });
    setCreatedKey(key);
    setShowCreate(false);
    reset();
  });

  const handleRotate = async () => {
    if (!rotateTarget) return;
    const key = await updateMutation.mutateAsync({
      uuid: rotateTarget.id,
      data: { rotate: true },
    });
    setCreatedKey(key);
    setRotateTarget(null);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    await revokeMutation.mutateAsync(revokeTarget.id);
    setRevokeTarget(null);
  };

  const columns: Column<ApiKeyResource>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="font-mono text-xs text-slate-400">{row.key_id}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <ApiKeyStatusBadge apiKey={row} />,
    },
    {
      key: "expires",
      header: "Expires",
      cell: (row) =>
        row.expires_at ? (
          new Date(row.expires_at).toLocaleDateString()
        ) : (
          <span className="text-slate-400">Never</span>
        ),
    },
    {
      key: "last_used",
      header: "Last Used",
      cell: (row) =>
        row.last_used_at ? (
          new Date(row.last_used_at).toLocaleDateString()
        ) : (
          <span className="text-slate-400">Never</span>
        ),
    },
    {
      key: "created",
      header: "Created",
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (row) => (
        <ActionMenu
          actions={[
            {
              label: "Rotate Key",
              icon: RotateCw,
              onClick: () => setRotateTarget(row),
              disabled: row.is_revoked,
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
      <PageHeader
        title="Integrations"
        description="Manage API keys for external integrations."
        breadcrumbs={[
          { label: "Dashboard", href: ".." },
          { label: "Integrations", isCurrent: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search API keys…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New API Key
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No API keys yet"
        emptyDescription="Create your first API key to integrate with external services."
        emptyAction={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New API Key
          </Button>
        }
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create API Key Modal */}
      <AppDialog open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="New API Key">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Key Name"
            placeholder="e.g. Production Key"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Expires At (optional)"
            type="date"
            error={errors.expires_at?.message}
            {...register("expires_at")}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowCreate(false); reset(); }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create Key"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Show Plain Key (after create or rotate) */}
      <AppDialog
        open={!!createdKey}
        onClose={() => setCreatedKey(null)}
        title="API Key Created"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            Copy this key now — it will not be shown again.
          </div>
          {createdKey?.plain_key && (
            <CopyField value={createdKey.plain_key} label="Secret Key" />
          )}
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setCreatedKey(null)}>
              Done
            </Button>
          </div>
        </div>
      </AppDialog>

      {/* Rotate Confirm */}
      <ConfirmDialog
        isOpen={!!rotateTarget}
        onClose={() => setRotateTarget(null)}
        onConfirm={handleRotate}
        title="Rotate API Key"
        message={`This will invalidate the current key for "${rotateTarget?.name}" and generate a new one. Any services using the old key will stop working.`}
        confirmLabel="Rotate"
        destructive
        isLoading={updateMutation.isPending}
      />

      {/* Revoke Confirm */}
      <ConfirmDialog
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        message={`This will permanently revoke "${revokeTarget?.name}". This cannot be undone.`}
        confirmLabel="Revoke"
        destructive
        isLoading={revokeMutation.isPending}
      />
    </>
  );
}
