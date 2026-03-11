import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Verifica se existe cookie de sessão do NextAuth/Auth.js
// O cookie pode ser: authjs.session-token, __Secure-authjs.session-token, ou variantes chunked (.0, .1...)
function hasSessionCookie(request: NextRequest): boolean {
  const allCookies = request.cookies.getAll();
  return allCookies.some(
    (c) =>
      c.name === "authjs.session-token" ||
      c.name.startsWith("authjs.session-token.") ||
      c.name === "__Secure-authjs.session-token" ||
      c.name.startsWith("__Secure-authjs.session-token.")
  );
}

export function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isLoggedIn = hasSessionCookie(request);

  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!isLoginPage && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
