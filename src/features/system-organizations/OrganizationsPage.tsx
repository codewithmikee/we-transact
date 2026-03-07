"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings, ExternalLink, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AppDialog from "@/components/ui/AppDialog";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import { StatusBadge } from "@/components/data/StatusBadge";
import { useSessionStore } from "@/stores/session.store";
import { OrgResource } from "@/types/api.types";
import { useCreateOrg, useDeleteOrg, useOrgs, useUpdateOrgById } from "./api";

const createSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  callback_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CreateForm = z.infer<typeof createSchema>;

export default function OrganizationsPage() {
  const router = useRouter();
  const setActiveOrg = useSessionStore((s) => s.setActiveOrg);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrgResource | null>(null);
  const [toggleTarget, setToggleTarget] = useState<OrgResource | null>(null);

  const { data, isLoading, isError, refetch } = useOrgs({ page, per_page: 15, search });
  const createMutation = useCreateOrg();
  const updateMutation = useUpdateOrgById();
  const deleteMutation = useDeleteOrg();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const handleCreate = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      name: values.name,
      slug: values.slug || undefined,
      callback_url: values.callback_url || null,
    });
    setShowCreate(false);
    reset();
  });

  const handleToggle = async () => {
    if (!toggleTarget) return;
    await updateMutation.mutateAsync({
      uuid: toggleTarget.id,
      data: { is_active: !toggleTarget.is_active },
    });
    setToggleTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleManage = (org: OrgResource) => {
    setActiveOrg(org.id);
    router.push(`/org/${org.slug}`);
  };

  const columns: Column<OrgResource>[] = [
    {
      key: "name",
      header: "Organization",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.slug}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge active={row.is_active} />,
    },
    {
      key: "callback",
      header: "Callback URL",
      cell: (row) =>
        row.callback_url ? (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] block">
            {row.callback_url}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">Not set</span>
        ),
    },
    {
      key: "created",
      header: "Created",
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: "manage",
      header: "",
      className: "w-28",
      cell: (row) => (
        <Button
          variant="outline"
          onClick={() => handleManage(row)}
          className="h-7 text-xs px-2.5"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Manage
        </Button>
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
              icon: Settings,
              onClick: () => router.push(`/system/organizations/${row.slug}`),
            },
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
        title="Organizations"
        description="Manage all platform organizations."
        breadcrumbs={[
          { label: "System", href: "/system" },
          { label: "Organizations", isCurrent: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search organizations…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Organization
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No organizations yet"
        emptyDescription="Create your first organization to get started."
        emptyAction={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Organization
          </Button>
        }
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create Modal */}
      <AppDialog open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="New Organization">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Organization Name"
            placeholder="Acme Corp"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Slug (optional — auto-generated if blank)"
            placeholder="acme-corp"
            error={errors.slug?.message}
            {...register("slug")}
          />
          <Input
            label="Callback URL (optional)"
            type="url"
            placeholder="https://example.com/callback"
            error={errors.callback_url?.message}
            {...register("callback_url")}
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
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Toggle Confirm */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={`${toggleTarget?.is_active ? "Deactivate" : "Activate"} Organization`}
        message={`This will ${toggleTarget?.is_active ? "deactivate" : "activate"} "${toggleTarget?.name}".`}
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        destructive={toggleTarget?.is_active}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Organization"
        message={`Permanently delete "${deleteTarget?.name}"? This cannot be undone and will remove all associated data.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
