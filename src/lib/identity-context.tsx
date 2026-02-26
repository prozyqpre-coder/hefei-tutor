"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ViewIdentity = "student" | "parent";

const STORAGE_KEY = "hefei-tutor-identity";

export const IdentityContext = createContext<{
  identity: ViewIdentity;
  setIdentity: (v: ViewIdentity) => void;
}>({ identity: "student", setIdentity: () => {} });

export function useViewIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) return { identity: "student" as ViewIdentity, setIdentity: () => {} };
  return ctx;
}

function getStored(): ViewIdentity {
  if (typeof window === "undefined") return "student";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "parent" ? "parent" : "student";
}

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [identity, setState] = useState<ViewIdentity>("student");
  useEffect(() => {
    setState(getStored());
  }, []);
  const setIdentity = useCallback((v: ViewIdentity) => {
    setState(v);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, v);
  }, []);
  return (
    <IdentityContext.Provider value={{ identity, setIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
}
