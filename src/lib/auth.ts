/**
 * Configuración de Auth.js (NextAuth v5).
 *
 * - Estrategia: JWT (cookies httpOnly).
 * - Provider: Credentials (email + contraseña contra Usuario.passwordHash).
 * - Inyectamos `id` y `rol` en la sesión para la autorización por rol.
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import type { Rol } from "@/lib/enums";

// -------- Tipado: enriquecemos la sesión con id y rol --------
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: Rol;
      centroId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    rol: Rol;
    centroId: string | null;
  }
}


const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!usuario || !usuario.activo) return null;

        const ok = await bcrypt.compare(parsed.data.password, usuario.passwordHash);
        if (!ok) return null;

        return {
          id: usuario.id,
          email: usuario.email,
          name: usuario.nombre,
          rol: usuario.rol as Rol,
          centroId: usuario.centroId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.rol = user.rol;
        token.centroId = user.centroId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as Rol;
        session.user.centroId = token.centroId as string | null;
      }
      return session;
    },
  },
});
