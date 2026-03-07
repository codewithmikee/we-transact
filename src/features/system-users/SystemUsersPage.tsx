"use client";

import { useState } from "react";
import { UserPlus, ToggleLeft, ToggleRight } from "lucide-react";
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
import { StatusBadge } from "@/components/data/StatusBadge";
import { UserResource } from "@/types/api.types";
import {
  useCreateSystemAdmin,
  useSystemAdmins,
  useToggleSystemAdminStatus,
} from "./api";

const ROLE_LABELS: Record<string, string> = {
  sy_super_admin: "Super Admin",
  sy_admin: "Admin",
};

const createSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    user_name: z.string().min(2, "Username is required"),
    email: z.string().email("Valid email required"),
    phone_number: z.string().optional(),
    password: z.string().min(8, "At least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

type CreateForm = z.infer<typeof createSchema>;

export default function SystemUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<UserResource | null>(null);

  const { data, isLoading, isError, refetch } = useSystemAdmins({ page, per_page: 15, search });
  const createMutation = useCreateSystemAdmin();
  const toggleMutation = useToggleSystemAdminStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const handleCreate = handleSubmit(async (values) => {
    await createMutation.mutateAsync({
      ...values,
      role: "sy_admin",
    });
    setShowCreate(false);
    reset();
  });

  const handleToggle = async () => {
    if (!toggleTarget) return;
    await toggleMutation.mutateAsync({
      uuid: toggleTarget.id,
      is_active: !toggleTarget.is_active,
    });
    setToggleTarget(null);
  };

  const columns: Column<UserResource>[] = [
    {
      key: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">@{row.user_name}</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (row) => row.email,
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => (
        <Badge variant={row.role === "sy_super_admin" ? "info" : "secondary"}>
          {ROLE_LABELS[row.role] ?? row.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge active={row.is_active} />,
    },
    {
      key: "created",
      header: "Created",
      cell: (row) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      header: "",
      className: "w-10",
      cell: (row) => (
        <ActionMenu
          actions={[
            {
              label: row.is_active ? "Deactivate" : "Activate",
              icon: row.is_active ? ToggleLeft : ToggleRight,
              onClick: () => setToggleTarget(row),
              disabled: row.role === "sy_super_admin",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="System Users"
        description="Manage system administrators."
        breadcrumbs={[
          { label: "System", href: "/system" },
          { label: "Users", isCurrent: true },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search admins…"
          className="w-full sm:w-72"
        />
        <Button variant="primary" onClick={() => setShowCreate(true)} className="shrink-0">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No system admins yet"
        emptyDescription="Add system administrators to manage the platform."
        emptyAction={
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        }
      />

      <PaginationBar meta={data?.meta} onPageChange={setPage} className="mt-3" />

      {/* Create Modal */}
      <AppDialog open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="Add System Admin">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Full Name" error={errors.name?.message} {...register("name")} />
            <Input label="Username" error={errors.user_name?.message} {...register("user_name")} />
          </div>
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone (optional)"
            type="tel"
            {...register("phone_number")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm"
              type="password"
              error={errors.password_confirmation?.message}
              {...register("password_confirmation")}
            />
          </div>
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
              {createMutation.isPending ? "Creating…" : "Create Admin"}
            </Button>
          </div>
        </form>
      </AppDialog>

      {/* Toggle Confirm */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        title={`${toggleTarget?.is_active ? "Deactivate" : "Activate"} Admin`}
        message={`This will ${toggleTarget?.is_active ? "deactivate" : "activate"} "${toggleTarget?.name}".`}
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        destructive={toggleTarget?.is_active}
        isLoading={toggleMutation.isPending}
      />
    </>
  );
}
