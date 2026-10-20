import "server-only";
import { NextResponse } from "next/server";
import { SupabaseConfigurationError } from "@/lib/supabase/server";

type ErrorLike = { code?: unknown; message?: unknown };
type ErrorCategory = "configuration" | "transport" | "authentication" | "permission" | "query" | "unknown";

type SafeError = {
  code: string;
  category: ErrorCategory;
  message: string;
  status: number;
};

function classify(error: unknown): SafeError {
  if (error instanceof SupabaseConfigurationError) {
    return { code: error.code, category: "configuration", message: "Configuração do Supabase inválida.", status: 503 };
  }

  const source = error && typeof error === "object" ? error as ErrorLike : {};
  const rawCode = typeof source.code === "string" ? source.code : "";
  const rawMessage = typeof source.message === "string" ? source.message : error instanceof Error ? error.message : "";

  if (/fetch failed|econnrefused|enotfound|eacces|timeout/i.test(rawMessage)) {
    return { code: "SUPABASE_TRANSPORT_ERROR", category: "transport", message: "Falha de comunicação com o Supabase.", status: 503 };
  }
  if (["PGRST301", "PGRST302"].includes(rawCode) || /jwt|api key|authentication/i.test(rawMessage)) {
    return { code: rawCode || "SUPABASE_AUTH_ERROR", category: "authentication", message: "Credencial do Supabase rejeitada.", status: 503 };
  }
  if (rawCode === "42501" || /permission denied|row-level security/i.test(rawMessage)) {
    return { code: rawCode || "SUPABASE_PERMISSION_ERROR", category: "permission", message: "Permissão insuficiente no Supabase.", status: 500 };
  }
  if (/^(42P01|42703|PGRST)/.test(rawCode)) {
    return { code: rawCode, category: "query", message: "Schema ou consulta do Supabase incompatível.", status: 500 };
  }
  return { code: rawCode || "SUPABASE_UNKNOWN_ERROR", category: "unknown", message: "Falha não identificada na camada de dados.", status: 500 };
}

export function supabaseApiError(scope: string, error: unknown) {
  const safe = classify(error);
  console.error(scope, { code: safe.code, category: safe.category, message: safe.message });

  return NextResponse.json(
    { error: safe.status === 503 ? "Serviço de dados temporariamente indisponível." : "Não foi possível processar a solicitação." },
    { status: safe.status, headers: { "Cache-Control": "no-store" } },
  );
}
