/**
 * Configuração NextAuth temporariamente desativada para resolver erro 500 no Edge.
 * Stubs mínimos para permitir o build e acesso ao dashboard.
 */
import { NextResponse } from "next/server";

// Stub: auth() retorna sessão mock para liberar acesso ao dashboard
export async function auth() {
  return {
    user: { id: "guest", email: "guest@temp.local", name: "Visitante" },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Stub: handlers para rota /api/auth/[...nextauth] - evita crash
export const handlers = {
  GET: async () => NextResponse.json({ error: "Auth temporariamente desativado" }, { status: 501 }),
  POST: async () => NextResponse.json({ error: "Auth temporariamente desativado" }, { status: 501 }),
};

/*
// === CÓDIGO ORIGINAL COMENTADO ===
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);
        const users = [
          { email: process.env.ADMIN_EMAIL?.toLowerCase(), password: process.env.ADMIN_PASSWORD, id: "admin", name: "Administrador" },
          { email: process.env.USER_GCORREA_EMAIL?.toLowerCase(), password: process.env.USER_GCORREA_PASSWORD, id: "gcorrea", name: "Gabriel Corrêa" },
        ];
        const user = users.find((u) => u.email && u.password && email === u.email && password === u.password);
        if (!user?.email) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.email = user.email; } return token; },
    session({ session, token }) { if (session.user) session.user.id = token.id as string; return session; },
  },
});
*/
