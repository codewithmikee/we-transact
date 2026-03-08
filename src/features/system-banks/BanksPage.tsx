"use client";

import { useState, type ReactNode } from "react";
import { FlaskConical, Plus, Trash2, Pencil } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { BankReferencePlaygroundResult, BankResource } from "@/types/api.types";
import {
  useAllBanks,
  useBankReferencePlayground,
  useCreateBank,
  useDeleteBank,
  useUpdateBank,
} from "./api";

const bankSchema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  is_available: z.boolean().optional(),
});

const playgroundSchema = z.object({
  reference: z.string().min(3, "Reference, URL, or SMS body is required"),
  sms_sender: z.string().optional(),
  evidence_source: z.enum(["client_shared", "agent_inbox"]),
});

type BankForm = z.infer<typeof bankSchema>;
type PlaygroundForm = z.infer<typeof playgroundSchema>;

function ResultCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-muted/30 p-4", className)}>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function ResultRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
        {label}
      </span>
      <div className="sm:max-w-[70%] sm:text-right">{value}</div>
    </div>
  );
}

function StatusText({
  value,
  positiveLabel = "Yes",
  negativeLabel = "No",
  emptyLabel = "Not checked",
}: {
  value: boolean | null;
  positiveLabel?: string;
  negativeLabel?: string;
  emptyLabel?: string;
}) {
  if (value === true) {
    return <span className="font-medium text-emerald-600">{positiveLabel}</span>;
  }

  if (value === false) {
    return <span className="font-medium text-destructive">{negativeLabel}</span>;
  }

  return <span className="text-muted-foreground">{emptyLabel}</span>;
}

function PlaygroundResult({ result }: { result: BankReferencePlaygroundResult }) {
  return (
    <div className="space-y-4">
      <ResultCard title="Detection">
        <ResultRow label="Detected format" value={result.input.detected_format} />
        <ResultRow label="Evidence source" value={result.input.evidence_source} />
        <ResultRow
          label="Extractor"
          value={result.extraction.extractor_name ?? "No extractor matched"}
        />
        <ResultRow
          label="Normalized reference"
          value={
            <span className="font-mono text-xs text-foreground">
              {result.extraction.normalized_reference ?? "Not extracted"}
            </span>
          }
        />
      </ResultCard>

      <ResultCard title="Parsed transaction">
        <ResultRow
          label="Pattern"
          value={result.parsed_transaction.pattern_name ?? "No SMS pattern matched"}
        />
        <ResultRow label="SMS kind" value={result.parsed_transaction.sms_kind ?? "Not parsed"} />
        <ResultRow label="Owner" value={result.parsed_transaction.owner_name ?? "Unknown"} />
        <ResultRow
          label="Amount"
          value={
            result.parsed_transaction.amount !== null
              ? `ETB ${result.parsed_transaction.amount.toFixed(2)}`
              : "Not parsed"
          }
        />
        <ResultRow
          label="Occurred at"
          value={
            result.parsed_transaction.occurred_at
              ? new Date(result.parsed_transaction.occurred_at).toLocaleString()
              : "Not parsed"
          }
        />
        <ResultRow
          label="Sender"
          value={
            result.parsed_transaction.sender
              ? `${result.parsed_transaction.sender.name ?? "Unknown"}${result.parsed_transaction.sender.masked_account ? ` (${result.parsed_transaction.sender.masked_account})` : ""}`
              : "Not parsed"
          }
        />
        <ResultRow
          label="Receiver"
          value={
            result.parsed_transaction.receiver
              ? `${result.parsed_transaction.receiver.name ?? "Unknown"}${result.parsed_transaction.receiver.masked_account ? ` (${result.parsed_transaction.receiver.masked_account})` : ""}`
              : "Not parsed"
          }
        />
        <ResultRow
          label="Service fee"
          value={
            result.parsed_transaction.service_fee !== null
              ? `ETB ${result.parsed_transaction.service_fee.toFixed(2)}`
              : "None"
          }
        />
        <ResultRow
          label="VAT fee"
          value={
            result.parsed_transaction.vat_fee !== null
              ? `ETB ${result.parsed_transaction.vat_fee.toFixed(2)}`
              : "None"
          }
        />
        <ResultRow
          label="Balance"
          value={
            result.parsed_transaction.balance !== null
              ? `ETB ${result.parsed_transaction.balance.toFixed(2)}`
              : "Not parsed"
          }
        />
      </ResultCard>

      <ResultCard title="Flow mapping">
        <ResultRow
          label="Transaction type"
          value={result.flow_mapping.inferred_transaction_type ?? "Not inferred"}
        />
        <ResultRow
          label="Agent account"
          value={
            result.flow_mapping.agent_account
              ? `${result.flow_mapping.agent_account.name ?? "Unknown"}${result.flow_mapping.agent_account.masked_account ? ` (${result.flow_mapping.agent_account.masked_account})` : ""}`
              : "Not inferred"
          }
        />
        <ResultRow
          label="Client account"
          value={
            result.flow_mapping.client_account
              ? `${result.flow_mapping.client_account.name ?? "Unknown"}${result.flow_mapping.client_account.masked_account ? ` (${result.flow_mapping.client_account.masked_account})` : ""}`
              : "Not inferred"
          }
        />
        <ResultRow
          label="Notes"
          value={
            result.flow_mapping.notes.length > 0
              ? result.flow_mapping.notes.join(" ")
              : "None"
          }
        />
      </ResultCard>

      <ResultCard title="SMS validation">
        <ResultRow
          label="Provided sender"
          value={result.sms_validation.provided_sender ?? "Not provided"}
        />
        <ResultRow
          label="Sender match"
          value={
            <StatusText
              value={result.sms_validation.matches_sender}
              positiveLabel="Matches configured sender"
              negativeLabel="Does not match sender rules"
              emptyLabel={result.sms_validation.has_rules ? "Sender not provided" : "No sender rules"}
            />
          }
        />
        <ResultRow
          label="Configured senders"
          value={
            result.config_summary.sms_sender_numbers.length > 0
              ? result.config_summary.sms_sender_numbers.join(", ")
              : "None"
          }
        />
      </ResultCard>

      <ResultCard title="Bank receipt lookup">
        <ResultRow
          label="Enabled"
          value={<StatusText value={result.receipt_lookup.enabled} emptyLabel="No" />}
        />
        <ResultRow
          label="Lookup status"
          value={
            <StatusText
              value={result.receipt_lookup.successful}
              positiveLabel="Confirmed by bank receipt"
              negativeLabel="Lookup failed confirmation"
              emptyLabel={result.receipt_lookup.attempted ? "Lookup pending" : "Not attempted"}
            />
          }
        />
        <ResultRow
          label="Lookup URL"
          value={
            result.receipt_lookup.url ? (
              <a
                href={result.receipt_lookup.url}
                target="_blank"
                rel="noreferrer"
                className="break-all text-primary underline underline-offset-2"
              >
                {result.receipt_lookup.url}
              </a>
            ) : (
              "No lookup URL"
            )
          }
        />
        <ResultRow
          label="HTTP status"
          value={result.receipt_lookup.http_status ?? "Not fetched"}
        />
        <ResultRow
          label="Matched checks"
          value={
            result.receipt_lookup.matched_patterns.length > 0
              ? result.receipt_lookup.matched_patterns.join(", ")
              : "None"
          }
        />
        {result.receipt_lookup.body_excerpt ? (
          <div className="rounded-lg bg-background p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/80">
              Response excerpt
            </p>
            <p className="whitespace-pre-wrap break-words text-sm text-foreground/85">
              {result.receipt_lookup.body_excerpt}
            </p>
          </div>
        ) : null}
      </ResultCard>

      <ResultCard title="Config summary">
        <ResultRow
          label="Has config"
          value={<StatusText value={result.config_summary.has_config} emptyLabel="No" />}
        />
        <ResultRow
          label="Extractors"
          value={
            result.config_summary.extractor_names.length > 0
              ? result.config_summary.extractor_names.join(", ")
              : "None"
          }
        />
        <ResultRow
          label="Sender regexes"
          value={
            result.config_summary.sms_sender_regexes.length > 0
              ? result.config_summary.sms_sender_regexes.join(", ")
              : "None"
          }
        />
        <ResultRow
          label="SMS patterns"
          value={
            result.config_summary.sms_pattern_names.length > 0
              ? result.config_summary.sms_pattern_names.join(", ")
              : "None"
          }
        />
      </ResultCard>

      {result.errors.length > 0 ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-destructive">Validation issues</p>
          <ul className="mt-2 space-y-1 text-sm text-destructive/90">
            {result.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Reference parsed successfully and no validation issues were reported.
        </div>
      )}
    </div>
  );
}

export default function BanksPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<BankResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankResource | null>(null);
  const [playgroundTarget, setPlaygroundTarget] = useState<BankResource | null>(null);
  const [playgroundResult, setPlaygroundResult] = useState<BankReferencePlaygroundResult | null>(null);

  const { data, isLoading, isError, refetch } = useAllBanks({ page, per_page: 15, search });
  const createMutation = useCreateBank();
  const updateMutation = useUpdateBank();
  const deleteMutation = useDeleteBank();
  const playgroundMutation = useBankReferencePlayground();

  const createForm = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: { is_available: true },
  });
  const editForm = useForm<BankForm>({ resolver: zodResolver(bankSchema) });
  const playgroundForm = useForm<PlaygroundForm>({
    resolver: zodResolver(playgroundSchema),
    defaultValues: {
      reference: "",
      sms_sender: "",
      evidence_source: "client_shared",
    },
  });
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

  const openPlayground = (bank: BankResource) => {
    setPlaygroundTarget(bank);
    setPlaygroundResult(null);
    playgroundForm.reset({
      reference: "",
      sms_sender: "",
      evidence_source: "client_shared",
    });
  };

  const closePlayground = () => {
    setPlaygroundTarget(null);
    setPlaygroundResult(null);
    playgroundForm.reset({
      reference: "",
      sms_sender: "",
      evidence_source: "client_shared",
    });
  };

  const handlePlaygroundSubmit = playgroundForm.handleSubmit(async (values) => {
    if (!playgroundTarget) return;

    const result = await playgroundMutation.mutateAsync({
      uuid: playgroundTarget.id,
      data: {
        reference: values.reference,
        sms_sender: values.sms_sender?.trim() ? values.sms_sender.trim() : null,
        evidence_source: values.evidence_source,
      },
    });

    setPlaygroundResult(result);
  });

  const handleToggleAvailability = (bank: BankResource) => {
    updateMutation.mutate({ uuid: bank.id, data: { is_available: !bank.is_available } });
  };

  const columns: Column<BankResource>[] = [
    {
      key: "name",
      header: "Bank",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.code}</p>
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
              label: "Playground",
              icon: FlaskConical,
              onClick: () => openPlayground(row),
            },
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
              <p className="text-sm font-medium text-foreground/80">Available for orgs</p>
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

      <AppDialog
        open={!!playgroundTarget}
        onClose={closePlayground}
        title={`${playgroundTarget?.name ?? "Bank"} reference playground`}
        description="Paste a raw reference, a receipt URL, or the full SMS body. Optionally include the SMS sender to validate sender rules."
        maxWidth="3xl"
      >
        <form onSubmit={handlePlaygroundSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Reference, receipt URL, or full SMS body
            </label>
            <textarea
              rows={7}
              className={cn(
                "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground",
                "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-1",
                playgroundForm.formState.errors.reference
                  ? "border-destructive focus-visible:ring-destructive"
                  : undefined
              )}
              placeholder="DBP779U4BB or https://transactioninfo.ethiotelecom.et/receipt/DBP779U4BB or the full Telebirr SMS"
              {...playgroundForm.register("reference")}
            />
            {playgroundForm.formState.errors.reference?.message ? (
              <p className="text-xs font-medium text-destructive">
                {playgroundForm.formState.errors.reference.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                The parser will identify whether the input looks like a direct reference, URL, or SMS body.
              </p>
            )}
          </div>

          <Input
            label="SMS sender (optional)"
            placeholder="127"
            error={playgroundForm.formState.errors.sms_sender?.message}
            {...playgroundForm.register("sms_sender")}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Evidence source</label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              {...playgroundForm.register("evidence_source")}
            >
              <option value="client_shared">Client shared</option>
              <option value="agent_inbox">Agent inbox</option>
            </select>
            <p className="text-xs text-muted-foreground">
              This controls how the parsed SMS is mapped into deposit or withdraw flow.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closePlayground}
              disabled={playgroundMutation.isPending}
            >
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={playgroundMutation.isPending}>
              {playgroundMutation.isPending ? "Inspecting…" : "Inspect Reference"}
            </Button>
          </div>
        </form>

        {playgroundResult ? (
          <div className="mt-6">
            <PlaygroundResult result={playgroundResult} />
          </div>
        ) : null}
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
