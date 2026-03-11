import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware simplificado: desativa verificação de sessão temporariamente para resolver erro 500
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
