import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { AGENT_AI_CONFIG_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  AgentAiConfiguration,
  StoreAgentAiConfigurationInput,
  UpdateAgentAiConfigurationInput,
  AgentAiConfigurationListQuery,
  ResolvedAgentAiConfiguration,
  ApiPaginatedResponse,
  ApiSuccessResponse,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

export function useAgentAiConfigs(agentId: string, params?: AgentAiConfigurationListQuery) {
  return useApiQuery({
    queryKey: ["agent-ai-configs", agentId, params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<AgentAiConfiguration>>(AGENT_AI_CONFIG_ENDPOINTS.LIST(agentId), {
          params,
        })
        .then((r) => r.data),
    enabled: !!agentId,
  });
}

export function useCreateAgentAiConfig(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreAgentAiConfigurationInput) =>
      apiClient
        .post<ApiSuccessResponse<AgentAiConfiguration>>(AGENT_AI_CONFIG_ENDPOINTS.LIST(agentId), data)
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-ai-configs", agentId] });
      toast.success("AI Configuration assigned to agent");
    },
    onError: toastApiError,
  });
}

export function useUpdateAgentAiConfig(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ configId, data }: { configId: string; data: UpdateAgentAiConfigurationInput }) =>
      apiClient
        .patch<ApiSuccessResponse<AgentAiConfiguration>>(
          AGENT_AI_CONFIG_ENDPOINTS.DETAIL(agentId, configId),
          data
        )
        .then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-ai-configs", agentId] });
      toast.success("AI Configuration updated");
    },
    onError: toastApiError,
  });
}

export function useDeleteAgentAiConfig(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (configId: string) =>
      apiClient.delete(AGENT_AI_CONFIG_ENDPOINTS.DETAIL(agentId, configId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-ai-configs", agentId] });
      toast.success("AI Configuration removed from agent");
    },
    onError: toastApiError,
  });
}

// ── Runtime Hook ─────────────────────────────────────────────────────────────

export function useAgentRuntimeAiConfigs() {
  return useApiQuery({
    queryKey: ["agent-runtime-ai-configs"],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<ResolvedAgentAiConfiguration[]>>(AGENT_AI_CONFIG_ENDPOINTS.RUNTIME)
        .then((r) => r.data.data),
  });
}
