import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Lead, LeadInput } from "@/lib/types";

type LeadRow = {
  id: string; name: string; company: string; email: string; phone: string;
  value: number; stage: Lead["stage"]; score: number; source: string;
  last_contact: string; next_action: string; created_at: string;
};

const leadColumns = "id,name,company,email,phone,value,stage,score,source,last_contact,next_action,created_at";

const fromRow = (row: LeadRow): Lead => ({
  id: row.id, name: row.name, company: row.company, email: row.email,
  phone: row.phone, value: Number(row.value), stage: row.stage, score: row.score,
  source: row.source, lastContact: row.last_contact, nextAction: row.next_action,
  createdAt: row.created_at,
});

const toRow = (lead: LeadInput) => ({
  name: lead.name, company: lead.company, email: lead.email, phone: lead.phone,
  value: lead.value, stage: lead.stage, score: lead.score ?? 50, source: lead.source,
  next_action: lead.nextAction,
});

function db() {
  return getSupabaseAdmin();
}

export async function listLeads() {
  const { data, error } = await db().from("leads").select(leadColumns).order("created_at", { ascending: false });
  if (error) throw error;
  return (data as LeadRow[]).map(fromRow);
}

export async function getLeadById(id: string) {
  const { data, error } = await db().from("leads").select(leadColumns).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as LeadRow) : null;
}

export async function createLead(input: LeadInput) {
  const { data, error } = await db().from("leads").insert(toRow(input)).select(leadColumns).single();
  if (error) throw error;
  return fromRow(data as LeadRow);
}

export async function updateLead(id: string, input: Partial<LeadInput>) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.company !== undefined) payload.company = input.company;
  if (input.email !== undefined) payload.email = input.email;
  if (input.phone !== undefined) payload.phone = input.phone;
  if (input.value !== undefined) payload.value = input.value;
  if (input.stage !== undefined) payload.stage = input.stage;
  if (input.score !== undefined) payload.score = input.score;
  if (input.source !== undefined) payload.source = input.source;
  if (input.nextAction !== undefined) payload.next_action = input.nextAction;

  const { data, error } = await db().from("leads").update(payload).eq("id", id).select(leadColumns).single();
  if (error) throw error;
  return fromRow(data as LeadRow);
}

export async function deleteLead(id: string) {
  const { error } = await db().from("leads").delete().eq("id", id);
  if (error) throw error;
}
