"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { makePlatformClient } from "@/lib/api/platformClient";
import { PLATFORM_ENDPOINTS } from "@/lib/api/endpoints";
import {
  ApiPaginatedResponse,
  AgentAccountResource,
  BankResource,
  TransactionResource,
  PlatformDepositInput,
  PlatformWithdrawInput,
  ApiSuccessResponse,
} from "@/types/api.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { id: "deposit", name: "Deposit" },
  { id: "withdraw", name: "Withdraw" },
];

function makeClientRequestId(type: "deposit" | "withdraw") {
  return `test_${type}_${Date.now()}`;
}

function err(msg: string | undefined) {
  if (!msg) return null;
  return <p className="text-xs text-destructive mt-1">{msg}</p>;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  apiKeyName: string;
  /** Full plain_key (format: org_{key_id}.{secret}) stored in session after create/rotate */
  plainKey: string;
  onSuccess: (tx: TransactionResource) => void;
  onCancel: () => void;
}

export default function PlatformTestForm({ apiKeyName, plainKey, onSuccess, onCancel }: Props) {
  // ── Step 1 state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // ── Step 2 state ────────────────────────────────────────────────────────────
  const [agentAccountId, setAgentAccountId] = useState("");
  const [clientRequestId, setClientRequestId] = useState(() => makeClientRequestId("deposit"));
  const [clientAccountHolder, setClientAccountHolder] = useState("");
  const [clientAccountNumber, setClientAccountNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientReference, setClientReference] = useState("");
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [createdTx, setCreatedTx] = useState<TransactionResource | null>(null);

  // ── Data ────────────────────────────────────────────────────────────────────
  const parsedAmount = parseFloat(amount);
  const isAmountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const {
    data: banksData,
    isLoading: banksLoading,
    isError: banksError,
  } = useQuery({
    queryKey: ["platform-banks", plainKey, type, amount],
    queryFn: async () => {
      const r = await makePlatformClient(plainKey).get<ApiPaginatedResponse<BankResource>>(
        PLATFORM_ENDPOINTS.BANKS,
        {
          params: {
            per_page: 100,
            transaction_type: type,
            amount: parsedAmount,
          },
        },
      );
      return r.data;
    },
    enabled: isAmountValid,
    retry: false,
  });

  const bankOptions =
    banksData?.data.map((b) => ({ id: b.id, name: `${b.name} (${b.code})` })) ?? [];

  // Fetch available accounts via platform API key (only in step 2, deposit type)
  const { data: accountsData, isLoading: accountsLoading, isError: accountsError } = useQuery({
    queryKey: ["platform-accounts", plainKey, bankId, type, amount],
    queryFn: async () => {
      const r = await makePlatformClient(plainKey).get<ApiPaginatedResponse<AgentAccountResource>>(
        PLATFORM_ENDPOINTS.ACCOUNTS,
        {
          params: {
            bank_id: bankId,
            transaction_type: type,
            amount: parsedAmount,
            per_page: 100,
          },
        },
      );
      return r.data;
    },
    enabled: step === 2 && type === "deposit" && !!bankId && isAmountValid,
    retry: false,
  });

  const availableAccounts =
    accountsData?.data
      .filter((a) => a.is_active)
      .map((a) => ({
        id: a.id,
        name: `${a.holder_name} — ${a.account_number}`,
      })) ?? [];

  // ── Mutation ─────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async () => {
      const client = makePlatformClient(plainKey);
      const amountNum = parseFloat(amount);

      if (type === "deposit") {
        const payload: PlatformDepositInput = {
          amount: amountNum,
          bank_id: bankId,
          agent_account_id: agentAccountId,
          client_request_id: clientRequestId,
          ...(clientReference && { client_reference: clientReference }),
          client: {
            full_name: clientName.trim(),
            ...(clientPhone && { phone_number: clientPhone }),
          },
        };
        const r = await client.post<ApiSuccessResponse<TransactionResource>>(
          PLATFORM_ENDPOINTS.DEPOSITS,
          payload,
        );
        return r.data.data;
      } else {
        const payload: PlatformWithdrawInput = {
          amount: amountNum,
          bank_id: bankId,
          client_request_id: clientRequestId,
          ...(clientReference && { client_reference: clientReference }),
          client: {
            full_name: clientName.trim(),
            ...(clientPhone && { phone_number: clientPhone }),
          },
          client_account: {
            account_holder_name: clientAccountHolder,
            account_number: clientAccountNumber,
          },
        };
        const r = await client.post<ApiSuccessResponse<TransactionResource>>(
          PLATFORM_ENDPOINTS.WITHDRAWS,
          payload,
        );
        return r.data.data;
      }
    },
    onSuccess: (tx) => {
      setCreatedTx(tx);
      onSuccess(tx);
    },
  });

  // ── Step 1 validation ────────────────────────────────────────────────────────
  const handleStep1Next = () => {
    const errs: Record<string, string> = {};
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0)
      errs.amount = "Enter a valid amount greater than 0";
    if (!bankId) errs.bankId = "Bank is required";
    setStep1Errors(errs);
    if (Object.keys(errs).length === 0) {
      setStep(2);
      setStep2Errors({});
    }
  };

  // ── Step 2 validation ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (type === "deposit" && !agentAccountId) errs.agentAccountId = "Select an account";
    if (!clientRequestId.trim()) errs.clientRequestId = "Client request ID is required";
    if (!clientName.trim()) errs.clientName = "Client full name is required";
    if (type === "withdraw") {
      if (!clientAccountHolder.trim()) errs.clientAccountHolder = "Account holder name is required";
      if (!clientAccountNumber.trim()) errs.clientAccountNumber = "Account number is required";
    }
    setStep2Errors(errs);
    if (Object.keys(errs).length === 0) {
      createMutation.mutate();
    }
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (createdTx) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
              Transaction Created
            </p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
              Tracking code:{" "}
              <span className="font-mono font-semibold">{createdTx.tracking_code}</span>
              {" "}· Status: <span className="font-semibold">{createdTx.status}</span>
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel}>Close</Button>
        </div>
      </div>
    );
  }

  // ── Error banner ─────────────────────────────────────────────────────────────
  const mutationError = createMutation.isError
    ? ((createMutation.error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Failed to create transaction. Verify your API key is valid.")
    : null;

  // ── Step 1 ────────────────────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Testing <span className="font-semibold text-foreground">{apiKeyName}</span> via platform
          routes. This simulates a real platform integration call using your API key.
        </p>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Transaction Type
          </label>
          <Select
            options={TYPE_OPTIONS}
            value={TYPE_OPTIONS.find((o) => o.id === type) ?? TYPE_OPTIONS[0]}
            onChange={(opt) => {
              const nextType = opt.id as "deposit" | "withdraw";
              setType(nextType);
              setBankId("");
              setAgentAccountId("");
              setClientRequestId(makeClientRequestId(nextType));
            }}
          />
        </div>

        {/* Amount */}
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setBankId("");
            setAgentAccountId("");
          }}
          error={step1Errors.amount}
        />

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Available Banks</label>
          <Select
            options={bankOptions}
            value={
              bankOptions.find((b) => b.id === bankId) ?? {
                id: "",
                name: !isAmountValid
                  ? "Enter amount first…"
                  : banksLoading
                    ? "Loading available banks…"
                    : bankOptions.length === 0
                      ? "No eligible banks found"
                      : "Select bank…",
              }
            }
            onChange={(opt) => {
              setBankId(opt.id as string);
              setAgentAccountId("");
            }}
            disabled={!isAmountValid || banksLoading || bankOptions.length === 0}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            This uses <span className="font-medium">GET /platform/banks</span> with{" "}
            <span className="font-mono">transaction_type</span> and{" "}
            <span className="font-mono">amount</span>.
          </p>
          {banksError && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not fetch platform banks. Verify the API key and the amount constraints.
            </div>
          )}
          {!banksLoading && isAmountValid && bankOptions.length === 0 && !banksError && (
            <p className="mt-2 text-xs text-muted-foreground">
              No banks currently satisfy this transaction type and amount.
            </p>
          )}
          {err(step1Errors.bankId)}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleStep1Next}>
            Continue →
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2 ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        type="button"
        onClick={() => setStep(1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* Summary row */}
      <div className="rounded-lg bg-muted/40 border border-border px-4 py-3 text-sm flex flex-wrap gap-x-6 gap-y-1">
        <span>
          <span className="text-muted-foreground">Type:</span>{" "}
          <strong className="capitalize">{type}</strong>
        </span>
        <span>
          <span className="text-muted-foreground">Bank:</span>{" "}
          <strong>{bankOptions.find((b) => b.id === bankId)?.name ?? bankId}</strong>
        </span>
        <span>
          <span className="text-muted-foreground">Amount:</span>{" "}
          <strong>{parseFloat(amount).toFixed(2)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Client Request ID"
          placeholder="unique platform request ID"
          value={clientRequestId}
          onChange={(e) => setClientRequestId(e.target.value)}
          error={step2Errors.clientRequestId}
        />
        <Input
          label="Client Full Name"
          placeholder="e.g. Abebe Kebede"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          error={step2Errors.clientName}
        />
      </div>

      {/* Deposit: account selection */}
      {type === "deposit" && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Select Agent Account <span className="text-destructive">*</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Accounts available for this bank, fetched via your API key.
          </p>

          {accountsLoading ? (
            <p className="text-sm text-muted-foreground py-2">Fetching accounts…</p>
          ) : accountsError ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Could not fetch accounts. The API key may be invalid or expired.
            </div>
          ) : availableAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active accounts found for this bank. Add agent accounts first.
            </p>
          ) : (
            <Select
              options={availableAccounts}
              value={
                availableAccounts.find((a) => a.id === agentAccountId) ?? {
                  id: "",
                  name: "Select account…",
                }
              }
              onChange={(opt) => setAgentAccountId(opt.id as string)}
            />
          )}
          <p className="text-xs text-muted-foreground">
            This uses <span className="font-medium">GET /platform/accounts</span> with bank, type,
            and amount filters.
          </p>
          {err(step2Errors.agentAccountId)}
        </div>
      )}

      {/* Withdraw: client account */}
      {type === "withdraw" && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Client Account <span className="text-destructive">*</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Account Holder Name"
              placeholder="e.g. Abebe Kebede"
              value={clientAccountHolder}
              onChange={(e) => setClientAccountHolder(e.target.value)}
              error={step2Errors.clientAccountHolder}
            />
            <Input
              label="Account Number"
              placeholder="e.g. 1000200030004"
              value={clientAccountNumber}
              onChange={(e) => setClientAccountNumber(e.target.value)}
              error={step2Errors.clientAccountNumber}
            />
          </div>
        </div>
      )}

      {/* Optional client info */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-semibold text-foreground mb-3">
          Client Info{" "}
          <span className="text-muted-foreground font-normal text-xs">(phone and reference optional)</span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            placeholder="+251 9..."
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
          <Input
            label="Client Reference"
            placeholder="Platform ref / client ID"
            value={clientReference}
            onChange={(e) => setClientReference(e.target.value)}
            className="col-span-2"
          />
        </div>
      </div>

      {/* Error */}
      {mutationError && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          {mutationError}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="outline" onClick={onCancel} disabled={createMutation.isPending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={createMutation.isPending}>
          {createMutation.isPending
            ? "Creating…"
            : type === "deposit"
              ? "Create Deposit"
              : "Create Withdrawal"}
        </Button>
      </div>
    </div>
  );
}
