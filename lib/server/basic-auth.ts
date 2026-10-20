import "server-only";
import { timingSafeEqual } from "node:crypto";

type AuthConfig = { username: string; password: string };

export const BASIC_AUTH_CHALLENGE = 'Basic realm="Nexo CRM"';

export function getBasicAuthConfig(): AuthConfig | null {
  const username = process.env.CRM_BASIC_AUTH_USER;
  const password = process.env.CRM_BASIC_AUTH_PASSWORD;

  if (!username || !password) return null;
  return { username, password };
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function hasValidBasicAuth(request: Request, config = getBasicAuthConfig()) {
  if (!config) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return safeEqual(username, config.username) && safeEqual(password, config.password);
  } catch {
    return false;
  }
}

export function isSameOriginMutation(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export function apiAuthFailure() {
  const configured = getBasicAuthConfig() !== null;
  const status = configured ? 401 : 503;
  const error = configured
    ? "Credenciais inválidas ou ausentes."
    : "Proteção do CRM não configurada. Defina CRM_BASIC_AUTH_USER e CRM_BASIC_AUTH_PASSWORD.";

  return Response.json(
    { error },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(configured ? { "WWW-Authenticate": BASIC_AUTH_CHALLENGE } : {}),
      },
    },
  );
}

export function authorizeApiRequest(request: Request) {
  if (!hasValidBasicAuth(request)) return apiAuthFailure();
  if (!isSameOriginMutation(request)) {
    return Response.json({ error: "Origem da requisição não autorizada." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  return null;
}
