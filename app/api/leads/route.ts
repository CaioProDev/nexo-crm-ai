import { NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/leads-repository";
import { authorizeApiRequest } from "@/lib/server/basic-auth";
import { supabaseApiError } from "@/lib/server/supabase-api-error";
import { leadSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const authFailure = authorizeApiRequest(request);
  if (authFailure) return authFailure;

  try {
    return NextResponse.json(await listLeads(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return supabaseApiError("Leads API GET", error); }
}

export async function POST(request: Request) {
  const authFailure = authorizeApiRequest(request);
  if (authFailure) return authFailure;

  try {
    const parsed = leadSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dados do lead inválidos.", details: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json(await createLead(parsed.data), { status: 201 });
  } catch (error) { return supabaseApiError("Leads API POST", error); }
}
