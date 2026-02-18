"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeReports(
  orgId: string,
  onNewReport: () => void
) {
  const callbackRef = useRef(onNewReport);
  callbackRef.current = onNewReport;

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`reports-${orgId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
          filter: `org_id=eq.${orgId}`,
        },
        () => {
          callbackRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId]);
}
