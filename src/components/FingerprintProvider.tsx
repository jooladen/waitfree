"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getBrowserFingerprint } from "@/lib/fingerprint";

interface FingerprintContextType {
  fingerprint: string | null;
}

const FingerprintContext = createContext<FingerprintContextType>({
  fingerprint: null,
});

export function useFingerprint() {
  return useContext(FingerprintContext);
}

export default function FingerprintProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    getBrowserFingerprint().then(setFingerprint);
  }, []);

  return (
    <FingerprintContext.Provider value={{ fingerprint }}>
      {children}
    </FingerprintContext.Provider>
  );
}
