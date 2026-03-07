import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { ORG_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import { ApiSuccessResponse, OrgResource, UpdateOrgInput } from "@/types/api.types";
import { useApiQuery } from "./utils";

export function useOrg() {
  return useApiQuery({
    queryKey: ["org"],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<{ organization: OrgResource }>>(ORG_ENDPOINTS.CURRENT)
        .then((r) => {
          const org = r.data.data.organization;
          if (!org) throw new Error("Organization data missing from response");
          return org;
        }),
  });
}

export function useUpdateOrg() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOrgInput) =>
      apiClient
        .patch<ApiSuccessResponse<{ organization: OrgResource }>>(ORG_ENDPOINTS.CURRENT, data)
        .then((r) => r.data.data.organization),
    onSuccess: (org) => {
      qc.setQueryData(["org"], org);
      toast.success("Organization updated");
    },
    onError: toastApiError,
  });
}
