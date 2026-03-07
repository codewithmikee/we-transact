"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AppDialog from "@/components/ui/AppDialog";
import { Toggle } from "@/components/ui/Toggle";
import { DataTable, Column } from "@/components/data/DataTable";
import { ActionMenu } from "@/components/data/ActionMenu";
import { ConfirmDialog } from "@/components/data/ConfirmDialog";
import { SearchInput } from "@/components/data/SearchInput";
import { PaginationBar } from "@/components/data/PaginationBar";
import { BankResource } from "@/types/api.types";
import { useAllBanks, useCreateBank, useDeleteBank, useUpdateBank } from "./api";

const bankSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  is_available: z.boolean().optional(),
});

type BankForm = z.infer<typeof bankSchema>;

export default function BanksPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<BankResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankResource | null>(null);

  const { data, isLoading, isError, refetch } = useAllBanks({ page, per_page: 15, search });
  const createMutation = useCreateBank();
  const updateMutation = useUpdateBank();
  const deleteMutation = useDeleteBank();

  const createForm = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: { is_available: true },
  });
  const editForm = useForm<BankForm>({ resolver: zodResolver(bankSchema) });
  const createAvailable = useWatch({
    control: createForm.control,
    name: "is_available",
  });
  const editAvailable = useWatch({
    control: editForm.control,
    name: "is_available",
  });

  const handleCreate = createForm.handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    setShowCreate(false);
    createForm.reset({ is_available: true });
  });

  const openEdit = (bank: BankResource) => {
    setEditTarget(bank);
    editForm.reset({
      name: bank.name,
      code: bank.code,
      is_available: bank.is_available,
    });
  };

  const handleEdit = editForm.handleSubmit(async (values) => {
    if (!editTarget) return;
    await updateMutation.mutateAsync({ uuid: editTarget.id, data: values });
    setEditTarget(null);
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleToggleAvailability = (bank: BankResource) => {
    updateMutation.mutate({ uuid: bank.id, data: { is_available: !bank.is_available } });
  };

  const columns: Column<BankResource>[] = [
    {
      key: "name",
      header: "Bank",
      cell: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="font-mono text-xs text-slate-400">{row.code}</p>
        </div>
      ),
    },
    {
      key: "available",
      header: "Available",
      cell: (row) => (
        <Toggle
          checked={row.is_available}
          onChange={() => handleToggleAvailability(row)}
          disabled={updateMutation.isPending}
        />
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
      <PageHeader
        title="Banks"
        description="Manage payment banks available on the platform."
        breadcrumbs={[
          { label: "System", href: "/system" },
          { label: "Banks", isCurrent: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search banks…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Bank
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No banks yet"
        emptyDescription="Add banks to make them available for agent accounts."
        emptyAction={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bank
          </Button>
        }
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create Bank Modal */}
      <AppDialog
        open={showCreate}
        onClose={() => { setShowCreate(false); createForm.reset({ is_available: true }); }}
        title="Add Bank"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Bank Name"
            placeholder="Commercial Bank of Ethiopia"
            error={createForm.formState.errors.name?.message}
            {...createForm.register("name")}
          />
          <Input
            label="Bank Code"
            placeholder="CBE"
            error={createForm.formState.errors.code?.message}
            {...createForm.register("code")}
          />
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">Available for orgs</p>
              <p className="text-xs text-muted-foreground">Orgs can link accounts to this bank</p>
            </div>
            <Toggle
              checked={createAvailable ?? true}
              onChange={(v) => createForm.setValue("is_available", v)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowCreate(false); createForm.reset({ is_available: true }); }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding…" : "Add Bank"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Edit Bank Modal */}
      <AppDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit ${editTarget?.name ?? "Bank"}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Bank Name"
            error={editForm.formState.errors.name?.message}
            {...editForm.register("name")}
          />
          <Input
            label="Bank Code"
            error={editForm.formState.errors.code?.message}
            {...editForm.register("code")}
          />
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-slate-700">Available for orgs</p>
            </div>
            <Toggle
              checked={editAvailable ?? true}
              onChange={(v) => editForm.setValue("is_available", v)}
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
        title="Delete Bank"
        message={`Delete "${deleteTarget?.name}"? Agent accounts linked to this bank may be affected.`}
        confirmLabel="Delete"
        destructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
