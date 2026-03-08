import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { TRANSACTION_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  AssignTransactionInput,
  CompleteTransactionInput,
  ManualTransactionInput,
  ReassignTransactionInput,
  RejectTransactionInput,
  TransactionEventResource,
  TransactionAnalyticsSummary,
  TransactionAnalyticsSummaryQuery,
  TransactionListQuery,
  TransactionResource,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

// ── Queries ───────────────────────────────────────────────────────────────────

export function useTransactions(params?: TransactionListQuery) {
  return useApiQuery({
    queryKey: ["transactions", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<TransactionResource>>(TRANSACTION_ENDPOINTS.LIST, { params })
        .then((r) => r.data),
  });
}

export function useTransactionAnalyticsSummary(params: TransactionAnalyticsSummaryQuery, enabled = true) {
  return useApiQuery({
    queryKey: ["transaction-analytics-summary", params],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<TransactionAnalyticsSummary>>(TRANSACTION_ENDPOINTS.ANALYTICS_SUMMARY, {
          params,
        })
        .then((r) => r.data.data),
    enabled,
  });
}

export function useTransaction(uuid: string, enabled = true) {
  return useApiQuery({
    queryKey: ["transaction", uuid],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<TransactionResource>>(TRANSACTION_ENDPOINTS.DETAIL(uuid))
        .then((r) => r.data.data),
    enabled,
  });
}

export function useTransactionEvents(uuid: string, enabled = true) {
  return useApiQuery({
    queryKey: ["transaction-events", uuid],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<TransactionEventResource>>(TRANSACTION_ENDPOINTS.EVENTS(uuid), {
          params: { per_page: 50 },
        })
        .then((r) => r.data),
    enabled,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateManualTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ManualTransactionInput) =>
      apiClient
        .post<ApiSuccessResponse<TransactionResource>>(TRANSACTION_ENDPOINTS.MANUAL, data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction created");
    },
    onError: toastApiError,
  });
}

export function useAssignTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: AssignTransactionInput }) =>
      apiClient
        .post<ApiSuccessResponse<TransactionResource>>(TRANSACTION_ENDPOINTS.ASSIGN(uuid), data)
        .then((r) => r.data.data),
    onSuccess: (tx) => {
      qc.setQueryData(["transaction", tx.id], tx);
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction assigned");
    },
    onError: toastApiError,
  });
}

export function useReassignTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: ReassignTransactionInput }) =>
      apiClient
        .post<ApiSuccessResponse<TransactionResource>>(TRANSACTION_ENDPOINTS.REASSIGN(uuid), data)
        .then((r) => r.data.data),
    onSuccess: (tx) => {
      qc.setQueryData(["transaction", tx.id], tx);
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction reassigned");
    },
    onError: toastApiError,
  });
}

export function useRejectTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: RejectTransactionInput }) =>
      apiClient
        .post<ApiSuccessResponse<TransactionResource>>(TRANSACTION_ENDPOINTS.REJECT(uuid), data)
        .then((r) => r.data.data),
    onSuccess: (tx) => {
      qc.setQueryData(["transaction", tx.id], tx);
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction rejected");
    },
    onError: toastApiError,
  });
}

export function useCompleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: CompleteTransactionInput }) =>
      apiClient
        .post<ApiSuccessResponse<TransactionResource>>(TRANSACTION_ENDPOINTS.COMPLETE(uuid), data)
        .then((r) => r.data.data),
    onSuccess: (tx) => {
      qc.setQueryData(["transaction", tx.id], tx);
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction completed");
    },
    onError: toastApiError,
  });
}
