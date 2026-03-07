import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { PAYMENT_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  AgentAccountResource,
  ApiPaginatedResponse,
  ApiSuccessResponse,
  PaymentAgentResource,
  PaginationQuery,
  StoreAgentAccountInput,
  StoreAgentInput,
  UpdateAgentAccountInput,
  UpdateAgentInput,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

// ── Agents ────────────────────────────────────────────────────────────────────

export function usePaymentAgents(params?: PaginationQuery & { type?: string; is_active?: boolean }) {
  return useApiQuery({
    queryKey: ["payment-agents", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<PaymentAgentResource>>(PAYMENT_ENDPOINTS.AGENTS, { params })
        .then((r) => r.data),
  });
}

export function usePaymentAgent(uuid: string, enabled = true) {
  return useApiQuery({
    queryKey: ["payment-agent", uuid],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<{ agent: PaymentAgentResource }>>(PAYMENT_ENDPOINTS.AGENT(uuid))
        .then((r) => {
          const agent = r.data.data.agent;
          if (!agent) throw new Error("Agent data missing from response");
          return agent;
        }),
    enabled,
  });
}

export function useCreatePaymentAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreAgentInput) =>
      apiClient
        .post<ApiSuccessResponse<{ agent: PaymentAgentResource }>>(PAYMENT_ENDPOINTS.AGENTS, data)
        .then((r) => r.data.data.agent),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-agents"] });
      toast.success("Agent created");
    },
    onError: toastApiError,
  });
}

export function useUpdatePaymentAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateAgentInput }) =>
      apiClient
        .patch<ApiSuccessResponse<{ agent: PaymentAgentResource }>>(
          PAYMENT_ENDPOINTS.AGENT(uuid),
          data,
        )
        .then((r) => r.data.data.agent),
    onSuccess: (agent) => {
      qc.setQueryData(["payment-agent", agent.id], agent);
      qc.invalidateQueries({ queryKey: ["payment-agents"] });
      toast.success("Agent updated");
    },
    onError: toastApiError,
  });
}

export function useDeletePaymentAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => apiClient.delete(PAYMENT_ENDPOINTS.AGENT(uuid)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-agents"] });
      toast.success("Agent deleted");
    },
    onError: toastApiError,
  });
}

export function useGenerateConnectCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) =>
      apiClient
        .post<ApiSuccessResponse<{ agent: PaymentAgentResource }>>(
          PAYMENT_ENDPOINTS.AGENT_CONNECT_CODE(uuid),
        )
        .then((r) => r.data.data.agent),
    onSuccess: (agent) => {
      qc.setQueryData(["payment-agent", agent.id], agent);
      qc.invalidateQueries({ queryKey: ["payment-agents"] });
    },
    onError: toastApiError,
  });
}

// ── Agent Accounts ────────────────────────────────────────────────────────────

export function useAgentAccounts(agentUuid: string, enabled = true) {
  return useApiQuery({
    queryKey: ["agent-accounts", agentUuid],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<AgentAccountResource>>(
          `${PAYMENT_ENDPOINTS.AGENT(agentUuid)}/accounts`,
        )
        .then((r) => r.data),
    enabled,
  });
}

export function useCreateAgentAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      agentUuid,
      data,
    }: {
      agentUuid: string;
      data: StoreAgentAccountInput;
    }) =>
      apiClient
        .post<ApiSuccessResponse<{ account: AgentAccountResource }>>(
          `${PAYMENT_ENDPOINTS.AGENT(agentUuid)}/accounts`,
          data,
        )
        .then((r) => r.data.data.account),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["agent-accounts", variables.agentUuid] });
      qc.invalidateQueries({ queryKey: ["payment-agent", variables.agentUuid] });
      toast.success("Account added");
    },
    onError: toastApiError,
  });
}

export function useUpdateAgentAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      agentUuid,
      accountUuid,
      data,
    }: {
      agentUuid: string;
      accountUuid: string;
      data: UpdateAgentAccountInput;
    }) =>
      apiClient
        .patch<ApiSuccessResponse<{ account: AgentAccountResource }>>(
          `${PAYMENT_ENDPOINTS.AGENT(agentUuid)}/accounts/${accountUuid}`,
          data,
        )
        .then((r) => r.data.data.account),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["agent-accounts", variables.agentUuid] });
      toast.success("Account updated");
    },
    onError: toastApiError,
  });
}

export function useDeleteAgentAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      agentUuid,
      accountUuid,
    }: {
      agentUuid: string;
      accountUuid: string;
    }) =>
      apiClient.delete(
        `${PAYMENT_ENDPOINTS.AGENT(agentUuid)}/accounts/${accountUuid}`,
      ),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["agent-accounts", variables.agentUuid] });
      toast.success("Account deleted");
    },
    onError: toastApiError,
  });
}
