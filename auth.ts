import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import type { Adapter } from "next-auth/adapters";
import { getPgPool } from "@/lib/db";
import { authConfig } from "@/auth.config";

// Simple password hashing for demo purposes
// In production, use proper password hashing
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

const pool = getPgPool();
if (!pool) {
  console.warn("⚠️ DATABASE_URL is missing or pool failed to initialize. NextAuth will run without a database adapter!");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: pool ? PostgresAdapter(pool) : undefined,
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const client = await pool?.connect();
          if (!client) {
            throw new Error("Database connection failed");
          }

          const result = await client.query(
            "SELECT id, email, password, name, role FROM users WHERE email = $1",
            [credentials.email]
          );

          await client.release();

          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];
          const isValidPassword = await verifyPassword(credentials.password as string, user.password);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role ?? "FARMHAND",
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ]
});
