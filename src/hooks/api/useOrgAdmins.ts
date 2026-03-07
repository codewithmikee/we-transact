import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { USER_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  ApiPaginatedResponse,
  PaginationQuery,
  StoreUserInput,
  UserResource,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

export function useOrgAdmins(params?: PaginationQuery) {
  return useApiQuery({
    queryKey: ["org-admins", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<UserResource>>(USER_ENDPOINTS.ORG_ADMINS, { params })
        .then((r) => r.data),
  });
}

export function useCreateOrgAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreUserInput) =>
      apiClient
        .post<{ data: { user: UserResource } }>(USER_ENDPOINTS.ORG_ADMINS, data)
        .then((r) => r.data.data.user),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-admins"] });
      toast.success("Admin created successfully");
    },
    onError: toastApiError,
  });
}

export function useToggleOrgAdminStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, is_active }: { uuid: string; is_active: boolean }) =>
      apiClient.patch(`${USER_ENDPOINTS.ORG_ADMINS}/${uuid}`, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-admins"] });
      toast.success("Status updated");
    },
    onError: toastApiError,
  });
}
