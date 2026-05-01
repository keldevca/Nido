import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const USERS = [
  {
    id: "1",
    name: process.env.AUTH_USER1_NAME ?? "Membre1",
    password: process.env.AUTH_USER1_PASSWORD ?? "",
  },
  {
    id: "2",
    name: process.env.AUTH_USER2_NAME ?? "Membre2",
    password: process.env.AUTH_USER2_PASSWORD ?? "",
  },
].filter((u) => u.password.length > 0);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        name: { label: "Nom", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) return null;
        const user = USERS.find(
          (u) =>
            u.name.toLowerCase() === credentials.name.toLowerCase() &&
            u.password === credentials.password
        );
        return user ?? null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.name = user.name;
      return token;
    },
    async session({ session, token }) {
      if (token?.name) session.user = { name: token.name as string };
      return session;
    },
  },
};
