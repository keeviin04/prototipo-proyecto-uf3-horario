import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DoorOpen, BookOpen, UsersRound, CalendarRange, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STAT_CONFIG = [
  {
    label: "Profesores",
    icon: Users,
    href: "/profesores",
    accent: "border-t-blue-500",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    label: "Aulas",
    icon: DoorOpen,
    href: "/aulas",
    accent: "border-t-emerald-500",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "Asignaturas",
    icon: BookOpen,
    href: "/asignaturas",
    accent: "border-t-violet-500",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
  {
    label: "Grupos",
    icon: UsersRound,
    href: "/grupos",
    accent: "border-t-amber-500",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    label: "Asignaciones",
    icon: CalendarRange,
    href: "/asignaciones",
    accent: "border-t-rose-500",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
  },
];

const SPRINTS = [
  {
    label: "Sprint 1",
    desc: "CRUD de profesores, aulas, asignaturas, grupos, franjas y centros",
    done: true,
  },
  {
    label: "Sprint 2",
    desc: "Alta/edición de asignaciones con detección de solapamientos",
    done: true,
  },
  {
    label: "Sprint 3",
    desc: "Vistas semanal, por profesor, por aula y por grupo + impresión PDF",
    done: true,
  },
  {
    label: "Sprint 4",
    desc: "Pulido final y documentación",
    done: false,
  },
];

export default async function DashboardPage() {
  const [profesores, aulas, asignaturas, grupos, asignaciones] = await Promise.all([
    prisma.profesor.count({ where: { activo: true } }),
    prisma.aula.count({ where: { activo: true } }),
    prisma.asignatura.count({ where: { activo: true } }),
    prisma.grupo.count({ where: { activo: true } }),
    prisma.asignacion.count(),
  ]);

  const counts = [profesores, aulas, asignaturas, grupos, asignaciones];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel principal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen del estado actual del sistema de horarios
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {STAT_CONFIG.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card
                className={cn(
                  "cursor-pointer border-t-2 transition-all duration-200 hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-2",
                  s.accent,
                )}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </CardTitle>
                  <div className={cn("rounded-md p-1.5", s.iconBg)}>
                    <Icon className={cn("h-4 w-4", s.iconColor)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{counts[i]}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Sprint stepper */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Estado del proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-0">
            {SPRINTS.map((sprint, i) => (
              <li key={sprint.label} className="flex gap-4">
                {/* Línea conectora + indicador */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                      sprint.done
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-muted-foreground/30 bg-muted",
                    )}
                  >
                    {sprint.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </div>
                  {i < SPRINTS.length - 1 && (
                    <div
                      className={cn(
                        "my-1 w-0.5 flex-1",
                        sprint.done ? "bg-emerald-500/30" : "bg-border",
                      )}
                      style={{ minHeight: 24 }}
                    />
                  )}
                </div>

                {/* Texto */}
                <div className="pb-6 pt-1">
                  <p
                    className={cn(
                      "text-sm font-semibold leading-tight",
                      sprint.done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {sprint.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sprint.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
