"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapa de segmentos de ruta a etiquetas legibles
const SEGMENT_LABELS: Record<string, string> = {
  profesores: "Profesores",
  aulas: "Aulas",
  asignaturas: "Asignaturas",
  grupos: "Grupos",
  franjas: "Franjas horarias",
  centros: "Centros",
  asignaciones: "Asignaciones",
  horarios: "Horarios",
  semanal: "Vista semanal",
  profesor: "Por profesor",
  aula: "Por aula",
  grupo: "Por grupo",
  nuevo: "Nuevo",
  editar: "Editar",
};

function buildBreadcrumb(pathname: string): string[] {
  if (pathname === "/") return ["Panel principal"];
  const parts: string[] = [];
  for (const seg of pathname.split("/").filter(Boolean)) {
    // Omitir UUIDs y hashes de segmentos dinámicos
    if (/^[0-9a-f-]{8,}$/i.test(seg)) continue;
    const label = SEGMENT_LABELS[seg];
    if (label) parts.push(label);
  }
  return parts;
}

const ROL_BADGE: Record<string, string> = {
  ADMIN: "bg-primary/10 text-primary",
  EDITOR: "bg-amber-500/10 text-amber-700",
  VIEWER: "bg-muted text-muted-foreground",
};

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user;
  const breadcrumbs = buildBreadcrumb(pathname);

  return (
    <header className="no-print sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6 shadow-sm">
      {/* Breadcrumb / contexto de página */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((label, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground/40">/</span>}
            <span
              className={cn(
                i === breadcrumbs.length - 1
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </span>
        ))}
      </nav>

      {/* Info de usuario + logout */}
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 text-sm md:flex">
          <UserCircle2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{user?.email}</span>
          {user?.rol && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                ROL_BADGE[user.rol] ?? ROL_BADGE["VIEWER"],
              )}
            >
              {user.rol}
            </span>
          )}
        </div>

        <div className="hidden h-5 border-l md:block" />

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </Button>
      </div>
    </header>
  );
}
