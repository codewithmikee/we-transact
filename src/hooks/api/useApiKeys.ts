import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { ORG_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  ApiKeyResource,
  ApiPaginatedResponse,
  ApiSuccessResponse,
  PaginationQuery,
  StoreApiKeyInput,
  UpdateApiKeyInput,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

export function useApiKeys(params?: PaginationQuery) {
  return useApiQuery({
    queryKey: ["api-keys", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<ApiKeyResource>>(ORG_ENDPOINTS.API_KEYS, { params })
        .then((r) => r.data),
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreApiKeyInput) =>
      apiClient
        .post<ApiSuccessResponse<{ api_key: ApiKeyResource }>>(ORG_ENDPOINTS.API_KEYS, data)
        .then((r) => r.data.data.api_key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      // Note: show plain_key in caller — do NOT toast the key value
      toast.success("API key created");
    },
    onError: toastApiError,
  });
}

export function useUpdateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateApiKeyInput }) =>
      apiClient
        .patch<ApiSuccessResponse<{ api_key: ApiKeyResource }>>(
          ORG_ENDPOINTS.API_KEY(uuid),
          data,
        )
        .then((r) => r.data.data.api_key),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key updated");
    },
    onError: toastApiError,
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) =>
      apiClient.delete(ORG_ENDPOINTS.API_KEY(uuid)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
    onError: toastApiError,
  });
}
