import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { BASIC_AUTH_CHALLENGE, getBasicAuthConfig, hasValidBasicAuth } from "@/lib/server/basic-auth";

export function proxy(request: NextRequest) {
  const config = getBasicAuthConfig();

  if (!config) {
    return new NextResponse("Nexo CRM indisponível: configure CRM_BASIC_AUTH_USER e CRM_BASIC_AUTH_PASSWORD.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (!hasValidBasicAuth(request, config)) {
    return new NextResponse("Autenticação necessária.", {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "text/plain; charset=utf-8",
        "WWW-Authenticate": BASIC_AUTH_CHALLENGE,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
