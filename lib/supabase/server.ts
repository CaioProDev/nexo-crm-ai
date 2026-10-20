import { createClient } from "@supabase/supabase-js";

export type SupabaseConfigurationCode =
  | "SUPABASE_NOT_CONFIGURED"
  | "SUPABASE_INVALID_URL"
  | "SUPABASE_PLACEHOLDER_URL"
  | "SUPABASE_INVALID_SERVICE_KEY";

export class SupabaseConfigurationError extends Error {
  constructor(public readonly code: SupabaseConfigurationCode) {
    super(code);
    this.name = "SupabaseConfigurationError";
  }
}

function hasServiceRole(key: string) {
  if (key.startsWith("sb_secret_")) return true;
  if (key.split(".").length !== 3) return false;

  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")) as { role?: string };
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) throw new SupabaseConfigurationError("SUPABASE_NOT_CONFIGURED");
  if (/your-project|seu-projeto/i.test(url)) throw new SupabaseConfigurationError("SUPABASE_PLACEHOLDER_URL");

  try {
    const parsed = new URL(url);
    const isLocal = ["localhost", "127.0.0.1"].includes(parsed.hostname);
    if ((!isLocal && parsed.protocol !== "https:") || (isLocal && !["http:", "https:"].includes(parsed.protocol))) {
      throw new SupabaseConfigurationError("SUPABASE_INVALID_URL");
    }
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) throw error;
    throw new SupabaseConfigurationError("SUPABASE_INVALID_URL");
  }

  if (!hasServiceRole(serviceRoleKey)) throw new SupabaseConfigurationError("SUPABASE_INVALID_SERVICE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
