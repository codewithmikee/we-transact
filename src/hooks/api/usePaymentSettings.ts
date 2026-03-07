import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { PAYMENT_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  ApiSuccessResponse,
  PaymentSettingsResource,
  UpdatePaymentSettingsInput,
} from "@/types/api.types";
import { useApiQuery } from "./utils";

export function usePaymentSettings() {
  return useApiQuery({
    queryKey: ["payment-settings"],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<{ payment_setting: PaymentSettingsResource }>>(
          PAYMENT_ENDPOINTS.SETTINGS,
        )
        .then((r) => r.data.data.payment_setting),
  });
}

export function useUpdatePaymentSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePaymentSettingsInput) =>
      apiClient
        .patch<ApiSuccessResponse<{ payment_setting: PaymentSettingsResource }>>(
          PAYMENT_ENDPOINTS.SETTINGS,
          data,
        )
        .then((r) => r.data.data.payment_setting),
    onSuccess: (settings) => {
      qc.setQueryData(["payment-settings"], settings);
      toast.success("Payment settings saved");
    },
    onError: toastApiError,
  });
}
