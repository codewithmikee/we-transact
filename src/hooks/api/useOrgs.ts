import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { ORG_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  ApiPaginatedResponse,
  ApiSuccessResponse,
  OrgResource,
  PaginationQuery,
  StoreOrgInput,
  UpdateOrgInput,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

export function useOrgs(params?: PaginationQuery & { is_active?: boolean }) {
  return useApiQuery({
    queryKey: ["orgs", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<OrgResource>>(ORG_ENDPOINTS.LIST, { params })
        .then((r) => r.data),
  });
}

export function useOrgById(uuid: string, enabled = true) {
  return useApiQuery({
    queryKey: ["org-detail", uuid],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<{ organization: OrgResource }>>(ORG_ENDPOINTS.DETAIL(uuid))
        .then((r) => {
          const org = r.data.data.organization;
          if (!org) throw new Error("Organization data missing from response");
          return org;
        }),
    enabled,
  });
}

export function useCreateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreOrgInput) =>
      apiClient
        .post<ApiSuccessResponse<{ organization: OrgResource }>>(ORG_ENDPOINTS.LIST, data)
        .then((r) => r.data.data.organization),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orgs"] });
      toast.success("Organization created");
    },
    onError: toastApiError,
  });
}

export function useUpdateOrgById() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateOrgInput }) =>
      apiClient
        .patch<ApiSuccessResponse<{ organization: OrgResource }>>(
          ORG_ENDPOINTS.DETAIL(uuid),
          data,
        )
        .then((r) => r.data.data.organization),
    onSuccess: (org) => {
      qc.setQueryData(["org-detail", org.id], org);
      qc.invalidateQueries({ queryKey: ["orgs"] });
      toast.success("Organization updated");
    },
    onError: toastApiError,
  });
}

export function useDeleteOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => apiClient.delete(ORG_ENDPOINTS.DETAIL(uuid)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orgs"] });
      toast.success("Organization deleted");
    },
    onError: toastApiError,
  });
}
