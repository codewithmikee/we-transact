import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { AI_REGISTRY_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  AiProviderResource,
  AiModelResource,
  AiCredentialResource,
  AiCredentialTestResult,
  StoreAiProviderInput,
  UpdateAiProviderInput,
  StoreAiModelInput,
  UpdateAiModelInput,
  StoreAiCredentialInput,
  UpdateAiCredentialInput,
  AiProviderListQuery,
  AiModelListQuery,
  AiCredentialListQuery,
  ApiPaginatedResponse,
  ApiSuccessResponse,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

// ── Providers ────────────────────────────────────────────────────────────────

export function useAiProviders(params?: AiProviderListQuery) {
  return useApiQuery({
    queryKey: ["ai-providers", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<AiProviderResource>>(AI_REGISTRY_ENDPOINTS.PROVIDERS, { params })
        .then((r) => r.data),
  });
}

export function useCreateAiProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreAiProviderInput) =>
      apiClient
        .post<ApiSuccessResponse<AiProviderResource>>(AI_REGISTRY_ENDPOINTS.PROVIDERS, data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
      toast.success("AI Provider created");
    },
    onError: toastApiError,
  });
}

export function useUpdateAiProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAiProviderInput }) =>
      apiClient
        .patch<ApiSuccessResponse<AiProviderResource>>(AI_REGISTRY_ENDPOINTS.PROVIDER(id), data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
      toast.success("AI Provider updated");
    },
    onError: toastApiError,
  });
}

export function useDeleteAiProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(AI_REGISTRY_ENDPOINTS.PROVIDER(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-providers"] });
      toast.success("AI Provider deleted");
    },
    onError: toastApiError,
  });
}

// ── Models ───────────────────────────────────────────────────────────────────

export function useAiModels(params?: AiModelListQuery) {
  return useApiQuery({
    queryKey: ["ai-models", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<AiModelResource>>(AI_REGISTRY_ENDPOINTS.MODELS, { params })
        .then((r) => r.data),
  });
}

export function useCreateAiModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreAiModelInput) =>
      apiClient
        .post<ApiSuccessResponse<AiModelResource>>(AI_REGISTRY_ENDPOINTS.MODELS, data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-models"] });
      toast.success("AI Model created");
    },
    onError: toastApiError,
  });
}

export function useUpdateAiModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAiModelInput }) =>
      apiClient
        .patch<ApiSuccessResponse<AiModelResource>>(AI_REGISTRY_ENDPOINTS.MODEL(id), data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-models"] });
      toast.success("AI Model updated");
    },
    onError: toastApiError,
  });
}

export function useDeleteAiModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(AI_REGISTRY_ENDPOINTS.MODEL(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-models"] });
      toast.success("AI Model deleted");
    },
    onError: toastApiError,
  });
}

// ── Credentials ───────────────────────────────────────────────────────────────

export function useAiCredentials(params?: AiCredentialListQuery) {
  return useApiQuery({
    queryKey: ["ai-credentials", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<AiCredentialResource>>(AI_REGISTRY_ENDPOINTS.CREDENTIALS, { params })
        .then((r) => r.data),
  });
}

export function useCreateAiCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreAiCredentialInput) =>
      apiClient
        .post<ApiSuccessResponse<AiCredentialResource>>(AI_REGISTRY_ENDPOINTS.CREDENTIALS, data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-credentials"] });
      toast.success("AI Credential created");
    },
    onError: toastApiError,
  });
}

export function useUpdateAiCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAiCredentialInput }) =>
      apiClient
        .patch<ApiSuccessResponse<AiCredentialResource>>(AI_REGISTRY_ENDPOINTS.CREDENTIAL(id), data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-credentials"] });
      toast.success("AI Credential updated");
    },
    onError: toastApiError,
  });
}

export function useRevokeAiCredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(AI_REGISTRY_ENDPOINTS.CREDENTIAL(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ai-credentials"] });
      toast.success("AI Credential revoked");
    },
    onError: toastApiError,
  });
}

export function useTestAiCredential() {
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post<ApiSuccessResponse<AiCredentialTestResult>>(AI_REGISTRY_ENDPOINTS.TEST_CREDENTIAL(id))
        .then((r) => r.data.data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || "AI Credential is valid");
      } else {
        toast.error(data.message || "AI Credential test failed");
      }
    },
    onError: toastApiError,
  });
}
