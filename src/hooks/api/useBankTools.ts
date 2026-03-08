import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { TOOL_ENDPOINTS } from "@/lib/api/endpoints";
import { toastApiError } from "@/lib/api/error";
import {
  ApiSuccessResponse,
  BankTransactionToolBankResource,
  ExtractBankTransactionReferenceResult,
  ParseBankTransactionSmsResult,
  ResolveBankTransactionResult,
  ValidateBankTransactionSmsResult,
  ValidateBankTransactionResult,
  BankTransactionParticipant,
} from "@/types/api.types";

export function useBankToolBanks() {
  return useQuery({
    queryKey: ["bank-tool-banks"],
    queryFn: () =>
      apiClient
        .get<ApiSuccessResponse<BankTransactionToolBankResource[]>>(
          TOOL_ENDPOINTS.BANK_TRANSACTIONS.BANKS
        )
        .then((r) => r.data.data),
    staleTime: 5 * 60_000,
  });
}

export function useExtractReference() {
  return useMutation({
    mutationFn: (data: { bank_code: string; reference: string }) =>
      apiClient
        .post<ApiSuccessResponse<ExtractBankTransactionReferenceResult>>(
          TOOL_ENDPOINTS.BANK_TRANSACTIONS.EXTRACT_REFERENCE,
          data
        )
        .then((r) => r.data.data),
    onError: toastApiError,
  });
}

export function useParseSms() {
  return useMutation({
    mutationFn: (data: { bank_code: string; reference: string }) =>
      apiClient
        .post<ApiSuccessResponse<ParseBankTransactionSmsResult>>(
          TOOL_ENDPOINTS.BANK_TRANSACTIONS.PARSE_SMS,
          data
        )
        .then((r) => r.data.data),
    onError: toastApiError,
  });
}

export function useResolveBank() {
  return useMutation({
    mutationFn: (data: { bank_code: string; reference: string }) =>
      apiClient
        .post<ApiSuccessResponse<ResolveBankTransactionResult>>(
          TOOL_ENDPOINTS.BANK_TRANSACTIONS.RESOLVE_BANK,
          data
        )
        .then((r) => r.data.data),
    onError: toastApiError,
  });
}

export interface ExpectedTransaction {
  amount: number;
  direction: "sender_to_receiver";
  sender: BankTransactionParticipant;
  receiver: BankTransactionParticipant;
}

export function useValidateSms() {
  return useMutation({
    mutationFn: (data: {
      bank_code: string;
      reference: string;
      expected: ExpectedTransaction;
    }) =>
      apiClient
        .post<ApiSuccessResponse<ValidateBankTransactionSmsResult>>(
          TOOL_ENDPOINTS.BANK_TRANSACTIONS.VALIDATE_SMS,
          data
        )
        .then((r) => r.data.data),
    onError: toastApiError,
  });
}

export function useValidateBank() {
  return useMutation({
    mutationFn: (data: {
      bank_code: string;
      reference: string;
      expected: ExpectedTransaction;
    }) =>
      apiClient
        .post<ApiSuccessResponse<ValidateBankTransactionResult>>(
          TOOL_ENDPOINTS.BANK_TRANSACTIONS.VALIDATE_BANK,
          data
        )
        .then((r) => r.data.data),
    onError: toastApiError,
  });
}
