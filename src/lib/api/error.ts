import { AxiosError } from "axios";
import { toast } from "sonner";

interface ApiErrorData {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Extracts a human-readable error message from an API error.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorData | undefined;
    if (data?.errors) {
      const messages = Object.values(data.errors).flat();
      return messages[0] ?? data.message ?? "Validation failed";
    }
    return data?.message ?? error.message ?? "Something went wrong";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

/**
 * Extracts field-level validation errors from a 422 response.
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof AxiosError && error.response?.status === 422) {
    const data = error.response.data as ApiErrorData | undefined;
    if (data?.errors) {
      return Object.fromEntries(
        Object.entries(data.errors).map(([k, v]) => [k, v[0]]),
      );
    }
  }
  return {};
}

/**
 * Shows a toast error from an API error. Use as the `onError` callback
 * in TanStack Query mutations.
 */
export function toastApiError(error: unknown) {
  toast.error(getApiErrorMessage(error));
}
