import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimitLogin } from "@/lib/auth/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify",
  },
  providers: [
    Email({
      from: "Canvist <no-reply@canvist.local>",
      sendVerificationRequest({ identifier, url }) {
        console.log("\n[Canvist] Magic link sign-in");
        console.log(`To: ${identifier}`);
        console.log(url);
        console.log("\n");
      },
    }),
    Credentials({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, req) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();

        // Rate limit activat
        const ip = req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
        const rl = rateLimitLogin({
          key: `${ip}:${email}`,
          maxAttempts: 8,
          windowMs: 10 * 60 * 1000,
          blockMs: 10 * 60 * 1000,
        });
        if (!rl.ok) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, passwordHash: true },
        });

        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        // @ts-ignore
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

export default NextAuth(authOptions);