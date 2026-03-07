import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { PAYMENT_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  BankResource,
  PaginationQuery,
  StoreBankInput,
  UpdateBankInput,
} from "@/types/api.types";

/** Available banks for the org — used in account creation forms */
export function useAvailableBanks() {
  return useQuery({
    queryKey: ["banks-available"],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<BankResource>>(PAYMENT_ENDPOINTS.BANKS_AVAILABLE, {
          params: { per_page: 100 },
        })
        .then((r) => r.data.data),
    staleTime: 5 * 60_000,
  });
}

/** All banks with pagination — system admin */
export function useAllBanks(params?: PaginationQuery) {
  return useQuery({
    queryKey: ["banks-all", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<BankResource>>(PAYMENT_ENDPOINTS.BANKS, { params })
        .then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useCreateBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreBankInput) =>
      apiClient
        .post<ApiSuccessResponse<{ bank: BankResource }>>(PAYMENT_ENDPOINTS.BANKS, data)
        .then((r) => r.data.data.bank),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks-all"] });
      qc.invalidateQueries({ queryKey: ["banks-available"] });
      toast.success("Bank created");
    },
    onError: toastApiError,
  });
}

export function useUpdateBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateBankInput }) =>
      apiClient
        .patch<ApiSuccessResponse<{ bank: BankResource }>>(PAYMENT_ENDPOINTS.BANK(uuid), data)
        .then((r) => r.data.data.bank),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks-all"] });
      qc.invalidateQueries({ queryKey: ["banks-available"] });
      toast.success("Bank updated");
    },
    onError: toastApiError,
  });
}

export function useDeleteBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => apiClient.delete(PAYMENT_ENDPOINTS.BANK(uuid)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks-all"] });
      qc.invalidateQueries({ queryKey: ["banks-available"] });
      toast.success("Bank deleted");
    },
    onError: toastApiError,
  });
}
