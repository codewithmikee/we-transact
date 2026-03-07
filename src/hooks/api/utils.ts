/**
 * useApiQuery — drop-in replacement for useQuery that gates execution on a
 * valid access token being present in the Zustand session store.
 *
 * Why: TanStack Query fires queries immediately on component mount.  On a page
 * refresh, Zustand resets (accessToken = null) while bootstrapSession() is
 * still in-flight.  Without gating, every query fires without a Bearer token,
 * gets a 401, and TanStack Query may surface "Query data cannot be undefined"
 * before the interceptor can retry.
 *
 * With this wrapper, queries sit disabled until bootstrapSession() resolves and
 * calls setSession(), which updates accessToken in Zustand.  The reactive
 * selector triggers a re-render and enables all pending queries at once —
 * with the token already in the store so the request interceptor can attach it.
 */
import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { useSessionStore } from "@/stores/session.store";

export function useApiQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): ReturnType<typeof useQuery<TQueryFnData, TError, TData, TQueryKey>> {
  const hasToken = useSessionStore((s) => !!s.accessToken);

  return useQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
    // AND with the caller's own enabled flag so conditional hooks still work
    enabled: hasToken && (options.enabled !== false),
  });
}
