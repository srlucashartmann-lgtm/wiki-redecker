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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const users = [
          {
            email: process.env.ADMIN_EMAIL?.toLowerCase(),
            password: process.env.ADMIN_PASSWORD,
            id: "admin",
            name: "Administrador",
          },
          {
            email: process.env.USER_GCORREA_EMAIL?.toLowerCase(),
            password: process.env.USER_GCORREA_PASSWORD,
            id: "gcorrea",
            name: "Gabriel Corrêa",
          },
        ];

        const user = users.find(
          (u) => u.email && u.password && email === u.email && password === u.password
        );

        if (!user?.email) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
