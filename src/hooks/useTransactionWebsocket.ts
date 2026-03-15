"use client";

import { useEffect, useMemo } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  TransactionEventResource,
  TransactionResource,
} from "@/types/api.types";

const EVENT_NAMES = ["transaction.new", "transaction.update"] as const;

export interface ReverbTransactionPayload {
  transaction: TransactionResource;
  event: TransactionEventResource;
  metadata: {
    event_type: string;
    actor_type: string;
    actor_id: string | null;
  };
}

interface UseTransactionWebsocketOptions {
  enabled: boolean;
  channels: string[];
  sessionToken?: string | null;
  platformApiKey?: string | null;
  organizationUuid?: string | null;
  onPayload?: (payload: ReverbTransactionPayload) => void;
}

export function useTransactionWebsocket({
  enabled,
  channels,
  sessionToken,
  platformApiKey,
  organizationUuid,
  onPayload,
}: UseTransactionWebsocketOptions) {
  const queryClient = useQueryClient();
  const channelKey = useMemo(() => channels.join("|"), [channels]);

  useEffect(() => {
    if (
      !enabled ||
      channels.length === 0 ||
      (!sessionToken && !platformApiKey) ||
      typeof window === "undefined"
    ) {
      return;
    }

    const host = process.env.NEXT_PUBLIC_REVERB_HOST;
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
    if (!host || !key) {
      console.warn("Reverb host or key is missing, realtime updates are disabled.");
      return;
    }

    const scheme = (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "https").replace("://", "");
    const port = Number(
      process.env.NEXT_PUBLIC_REVERB_PORT ??
        (scheme === "https" ? 443 : 80),
    );
    const forceTLS = scheme === "https";

    // Ensure Pusher is available before Echo instantiates.
    (window as typeof window & { Pusher?: typeof Pusher }).Pusher = Pusher;

    const echo = new Echo({
      broadcaster: "pusher",
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS,
      encrypted: forceTLS,
      disableStats: true,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: sessionToken ? `Bearer ${sessionToken}` : undefined,
          "X-API-KEY": platformApiKey ?? undefined,
        },
        params: {
          organization_uuid: organizationUuid ?? undefined,
        },
      },
    });

    const subscriptions = channels.map((name) => {
      const channel = echo.private(name);
      EVENT_NAMES.forEach((eventName) => channel.listen(eventName, handlePayload));
      return channel;
    });

    function handlePayload(payload: ReverbTransactionPayload) {
      const { transaction, event } = payload;

      queryClient.setQueryData(["transaction", transaction.id], transaction);

      queryClient.getQueryCache().findAll((query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === "transactions";
      }).forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (prev) => {
          if (!prev || !Array.isArray(prev.data)) return prev;

          const existingIndex = prev.data.findIndex((row) => row.id === transaction.id);
          const updatedRows = existingIndex >= 0
            ? prev.data.map((row, index) =>
                index === existingIndex ? transaction : row,
              )
            : [transaction, ...prev.data];

          if (prev.meta?.per_page && updatedRows.length > prev.meta.per_page) {
            updatedRows.splice(prev.meta.per_page);
          }

          return { ...prev, data: updatedRows };
        });
      });

      queryClient.setQueryData(["transaction-events", transaction.id], (prev) => {
        if (!prev || !Array.isArray(prev.data)) return prev;

        const existing = prev.data.filter((entry) => entry.id !== event.id);
        const next = [event, ...existing];
        if (prev.meta?.per_page && next.length > prev.meta.per_page) {
          next.splice(prev.meta.per_page);
        }

        return { ...prev, data: next };
      });

      onPayload?.(payload);
    }

    return () => {
      subscriptions.forEach((subscription) => {
        EVENT_NAMES.forEach((eventName) => subscription.stopListening(eventName));
        echo.leaveChannel(subscription.name);
      });
      echo.disconnect();
    };
  }, [
    enabled,
    sessionToken,
    platformApiKey,
    organizationUuid,
    channelKey,
  ]);
}
