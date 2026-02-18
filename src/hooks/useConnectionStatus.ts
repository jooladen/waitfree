"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useConnectionStatus(
  orgId: string,
  onReconnect: () => void
) {
  const [isConnected, setIsConnected] = useState(true);
  const wasDisconnectedRef = useRef(false);
  const callbackRef = useRef(onReconnect);
  callbackRef.current = onReconnect;

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`connection-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
          filter: `org_id=eq.${orgId}`,
        },
        () => {}
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (wasDisconnectedRef.current) {
            wasDisconnectedRef.current = false;
            callbackRef.current();
          }
          setIsConnected(true);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          wasDisconnectedRef.current = true;
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);

  return isConnected;
}
