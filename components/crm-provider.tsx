"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lead, LeadInput, LeadStage } from "@/lib/types";

type CRMContextValue = {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  mutating: boolean;
  reload: () => Promise<void>;
  addLead: (input: LeadInput) => Promise<Lead>;
  updateLead: (id: string, input: Partial<LeadInput>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  moveLead: (id: string, stage: LeadStage) => Promise<Lead>;
};

type ApiErrorBody = { error?: string };

const CRMContext = createContext<CRMContextValue | null>(null);

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({})) as ApiErrorBody & T;
  if (!response.ok) throw new Error(body.error ?? "Não foi possível concluir a operação.");
  return body;
}

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingMutations, setPendingMutations] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leads", { cache: "no-store" });
      setLeads(await readJson<Lead[]>(response));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leads", { cache: "no-store" })
      .then((response) => readJson<Lead[]>(response))
      .then((data) => { if (!cancelled) setLeads(data); })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os leads.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const withMutation = useCallback(async <T,>(operation: () => Promise<T>) => {
    setPendingMutations((count) => count + 1);
    setError(null);
    try {
      return await operation();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Não foi possível salvar a alteração.";
      setError(message);
      throw requestError;
    } finally {
      setPendingMutations((count) => Math.max(0, count - 1));
    }
  }, []);

  const addLead = useCallback((input: LeadInput) => withMutation(async () => {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const created = await readJson<Lead>(response);
    setLeads((current) => [created, ...current]);
    return created;
  }), [withMutation]);

  const updateLead = useCallback((id: string, input: Partial<LeadInput>) => withMutation(async () => {
    const response = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const updated = await readJson<Lead>(response);
    setLeads((current) => current.map((lead) => lead.id === id ? updated : lead));
    return updated;
  }), [withMutation]);

  const deleteLead = useCallback((id: string) => withMutation(async () => {
    const response = await fetch(`/api/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) await readJson(response);
    setLeads((current) => current.filter((lead) => lead.id !== id));
  }), [withMutation]);

  const moveLead = useCallback((id: string, stage: LeadStage) => updateLead(id, { stage }), [updateLead]);

  const value = useMemo(() => ({
    leads,
    loading,
    error,
    mutating: pendingMutations > 0,
    reload,
    addLead,
    updateLead,
    deleteLead,
    moveLead,
  }), [leads, loading, error, pendingMutations, reload, addLead, updateLead, deleteLead, moveLead]);

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error("useCRM must be used inside CRMProvider");
  return context;
}
