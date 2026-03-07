"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAllBanks } from "@/hooks/api/useBanks";
import { usePaymentAgents, useAgentAccounts } from "@/hooks/api/usePaymentAgents";
import { useCreateManualTransaction } from "@/hooks/api/useTransactions";
import { ManualTransactionInput, TransactionType } from "@/types/api.types";

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z
  .object({
    type: z.enum(["deposit", "withdraw"]),
    amount: z
      .coerce
      .number({ invalid_type_error: "Amount is required" })
      .gt(0, "Must be greater than 0"),
    bank_id: z.string().min(1, "Bank is required"),
    // Deposit: agent account selection
    agent_id: z.string().optional(),
    agent_account_id: z.string().optional(),
    // Client (all optional)
    client_full_name: z.string().optional(),
    client_phone_number: z.string().optional(),
    // Withdraw: client account (required for withdraw)
    client_account_holder_name: z.string().optional(),
    client_account_number: z.string().optional(),
    // References
    client_reference: z.string().optional(),
    external_reference: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "deposit") {
      if (!data.agent_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agent_id"],
          message: "Agent is required for deposit",
        });
      }
      if (!data.agent_account_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["agent_account_id"],
          message: "Agent account is required for deposit",
        });
      }
    }
    if (data.type === "withdraw") {
      if (!data.client_account_holder_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["client_account_holder_name"],
          message: "Account holder name is required",
        });
      }
      if (!data.client_account_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["client_account_number"],
          message: "Account number is required",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS = [
  { id: "deposit", name: "Deposit" },
  { id: "withdraw", name: "Withdraw" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManualTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: banksData, isLoading: banksLoading } = useAllBanks({ per_page: 100 });
  const { data: agentsData, isLoading: agentsLoading } = usePaymentAgents({ per_page: 100 });
  const createMutation = useCreateManualTransaction();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "deposit" },
  });

  const selectedType = useWatch({ control, name: "type" }) as TransactionType;
  const selectedAgentId = useWatch({ control, name: "agent_id" });
  const selectedBankId = useWatch({ control, name: "bank_id" });

  const { data: agentAccountsData, isLoading: accountsLoading } = useAgentAccounts(
    selectedAgentId ?? "",
    !!selectedAgentId,
  );

  const bankOptions =
    banksData?.data.map((b) => ({ id: b.id, name: `${b.name} (${b.code})` })) ?? [];

  const agentOptions =
    agentsData?.data
      .filter((a) => a.is_active)
      .map((a) => ({ id: a.id, name: a.name })) ?? [];

  // Filter agent accounts by selected bank (client-side)
  const agentAccountOptions =
    agentAccountsData?.data
      .filter((acc) => !selectedBankId || acc.bank.id === selectedBankId)
      .filter((acc) => acc.is_active)
      .map((acc) => ({
        id: acc.id,
        name: `${acc.holder_name} — ${acc.account_number}`,
      })) ?? [];

  const onSubmit = handleSubmit(async (values) => {
    const payload: ManualTransactionInput = {
      type: values.type,
      amount: values.amount,
      bank_id: values.bank_id,
      ...(values.agent_account_id && { agent_account_id: values.agent_account_id }),
      ...(values.client_reference && { client_reference: values.client_reference }),
      ...(values.external_reference && { external_reference: values.external_reference }),
    };

    // Client block — only included if there's any info
    const hasClientInfo = values.client_full_name || values.client_phone_number;
    if (hasClientInfo) {
      payload.client = {
        ...(values.client_full_name && { full_name: values.client_full_name }),
        ...(values.client_phone_number && { phone_number: values.client_phone_number }),
      };
    }

    // Client account — required for withdraw
    if (values.type === "withdraw") {
      payload.client_account = {
        account_holder_name: values.client_account_holder_name!,
        account_number: values.client_account_number!,
      };
    }

    await createMutation.mutateAsync(payload);
    reset();
    onSuccess();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Info banner */}
      <div className="flex gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2.5 text-sm text-blue-600 dark:text-blue-400">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Manual transactions are recorded with <strong>source&nbsp;=&nbsp;dashboard</strong> for
          audit purposes. Use this for testing or operational fallback only.
        </span>
      </div>

      {/* Type + Amount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Transaction Type
          </label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                options={TYPE_OPTIONS}
                value={TYPE_OPTIONS.find((o) => o.id === field.value) ?? TYPE_OPTIONS[0]}
                onChange={(opt) => field.onChange(opt.id)}
              />
            )}
          />
        </div>
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount")}
        />
      </div>

      {/* Bank */}
      <div>
        <label className="block text-sm font-medium text-foreground/80 mb-1">Bank</label>
        <Controller
          control={control}
          name="bank_id"
          render={({ field }) => (
            <Select
              options={bankOptions}
              value={
                bankOptions.find((b) => b.id === field.value) ?? {
                  id: "",
                  name: banksLoading ? "Loading banks…" : "Select bank…",
                }
              }
              onChange={(opt) => field.onChange(opt.id)}
            />
          )}
        />
        {errors.bank_id && (
          <p className="text-xs text-destructive mt-1">{errors.bank_id.message}</p>
        )}
      </div>

      {/* ── Deposit: agent account selection ─────────────────────────────── */}
      {selectedType === "deposit" && (
        <div className="border-t border-border pt-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Agent Account <span className="text-destructive">*</span>
          </p>

          {/* Agent */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Agent</label>
            <Controller
              control={control}
              name="agent_id"
              render={({ field }) => (
                <Select
                  options={agentOptions}
                  value={
                    agentOptions.find((a) => a.id === field.value) ?? {
                      id: "",
                      name: agentsLoading ? "Loading agents…" : "Select agent…",
                    }
                  }
                  onChange={(opt) => field.onChange(opt.id)}
                />
              )}
            />
            {errors.agent_id && (
              <p className="text-xs text-destructive mt-1">{errors.agent_id.message}</p>
            )}
          </div>

          {/* Agent account */}
          {selectedAgentId && (
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">
                Account
              </label>
              {accountsLoading ? (
                <p className="text-sm text-muted-foreground">Loading accounts…</p>
              ) : agentAccountOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active accounts for this agent
                  {selectedBankId ? " at the selected bank" : ""}.
                </p>
              ) : (
                <Controller
                  control={control}
                  name="agent_account_id"
                  render={({ field }) => (
                    <Select
                      options={agentAccountOptions}
                      value={
                        agentAccountOptions.find((a) => a.id === field.value) ?? {
                          id: "",
                          name: "Select account…",
                        }
                      }
                      onChange={(opt) => field.onChange(opt.id)}
                    />
                  )}
                />
              )}
              {errors.agent_account_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.agent_account_id.message}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Withdraw: client account (required) ──────────────────────────── */}
      {selectedType === "withdraw" && (
        <div className="border-t border-border pt-4">
          <p className="text-sm font-semibold text-foreground mb-3">
            Client Account <span className="text-destructive">*</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Account Holder Name"
              placeholder="e.g. Abebe Kebede"
              error={errors.client_account_holder_name?.message}
              {...register("client_account_holder_name")}
            />
            <Input
              label="Account Number"
              placeholder="e.g. 1000200030004"
              error={errors.client_account_number?.message}
              {...register("client_account_number")}
            />
          </div>
        </div>
      )}

      {/* Client info (always optional) */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground mb-1">
          Client Information{" "}
          <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <Input
            label="Full Name"
            placeholder="e.g. Abebe Kebede"
            {...register("client_full_name")}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+251 9..."
            {...register("client_phone_number")}
          />
        </div>
      </div>

      {/* References */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground mb-3">
          References{" "}
          <span className="text-muted-foreground font-normal text-xs">(optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Client Reference"
            placeholder="External client ref ID"
            {...register("client_reference")}
          />
          <Input
            label="External Reference"
            placeholder="Bank ref / receipt ID"
            {...register("external_reference")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={() => { reset(); onSuccess(); }}
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Creating…" : "Create Transaction"}
        </Button>
      </div>
    </form>
  );
}
