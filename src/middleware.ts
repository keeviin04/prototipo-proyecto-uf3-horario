/**
 * Middleware de Next.js: protege todas las rutas excepto /login,
 * /api/auth/* y los assets estáticos.
 *
 * Si el usuario no está autenticado y pide una ruta protegida,
 * lo redirige a /login con ?callbackUrl=<original>.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = nextUrl.pathname === "/login";
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

  // Permitir rutas públicas
  if (isApiAuth) return NextResponse.next();
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Resto de rutas requieren login
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Aplicamos a todo excepto assets de Next y archivos estáticos
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
