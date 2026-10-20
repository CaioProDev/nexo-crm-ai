import { NextResponse } from "next/server";
import { deleteLead, updateLead } from "@/lib/leads-repository";
import { authorizeApiRequest } from "@/lib/server/basic-auth";
import { supabaseApiError } from "@/lib/server/supabase-api-error";
import { leadIdSchema, leadUpdateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const authFailure = authorizeApiRequest(request);
  if (authFailure) return authFailure;

  try {
    const { id } = await context.params;
    if (!leadIdSchema.safeParse(id).success) return NextResponse.json({ error: "Identificador do lead inválido." }, { status: 400 });
    const parsed = leadUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Dados do lead inválidos.", details: parsed.error.flatten() }, { status: 400 });
    return NextResponse.json(await updateLead(id, parsed.data));
  } catch (error) { return supabaseApiError("Lead API PATCH", error); }
}

export async function DELETE(request: Request, context: Context) {
  const authFailure = authorizeApiRequest(request);
  if (authFailure) return authFailure;

  try {
    const { id } = await context.params;
    if (!leadIdSchema.safeParse(id).success) return NextResponse.json({ error: "Identificador do lead inválido." }, { status: 400 });
    await deleteLead(id);
    return new NextResponse(null, { status: 204 });
  }
  catch (error) { return supabaseApiError("Lead API DELETE", error); }
}
