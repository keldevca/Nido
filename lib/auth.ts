import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const USERS = [1, 2, 3]
  .map((i) => ({
    id: String(i),
    name: process.env[`AUTH_USER${i}_NAME`] ?? "",
    password: process.env[`AUTH_USER${i}_PASSWORD`] ?? "",
  }))
  .filter((u) => u.name.length > 0 && u.password.length > 0);

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
        if (!user) {
          console.log("[auth] FAIL", {
            triedName: credentials.name,
            triedPwLen: credentials.password.length,
            triedPwHex: Buffer.from(credentials.password).toString("hex"),
            knownUsers: USERS.map((u) => ({
              name: u.name,
              pwLen: u.password.length,
              pwHex: Buffer.from(u.password).toString("hex"),
            })),
          });
        }
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
