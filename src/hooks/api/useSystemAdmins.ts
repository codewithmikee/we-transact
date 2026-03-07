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

export function useSystemAdmins(params?: PaginationQuery) {
  return useApiQuery({
    queryKey: ["system-admins", params],
    queryFn: () =>
      apiClient
        .get<ApiPaginatedResponse<UserResource>>(USER_ENDPOINTS.SYSTEM_ADMINS, { params })
        .then((r) => r.data),
  });
}

export function useCreateSystemAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StoreUserInput) =>
      apiClient
        .post<{ data: { user: UserResource } }>(USER_ENDPOINTS.SYSTEM_ADMINS, data)
        .then((r) => r.data.data.user),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["system-admins"] });
      toast.success("System admin created");
    },
    onError: toastApiError,
  });
}

export function useToggleSystemAdminStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, is_active }: { uuid: string; is_active: boolean }) =>
      apiClient.patch(USER_ENDPOINTS.SYSTEM_ADMIN(uuid), { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["system-admins"] });
      toast.success("Status updated");
    },
    onError: toastApiError,
  });
}
