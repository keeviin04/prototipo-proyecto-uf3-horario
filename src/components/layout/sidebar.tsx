"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  BookOpen,
  UsersRound,
  Clock,
  CalendarDays,
  Building2,
  CalendarRange,
} from "lucide-react";

const navGroups = [
  {
    title: "General",
    items: [{ href: "/", label: "Panel principal", icon: LayoutDashboard }],
  },
  {
    title: "Horarios",
    items: [
      { href: "/horarios/semanal", label: "Vista semanal", icon: CalendarDays },
      { href: "/horarios/profesor", label: "Por profesor", icon: Users },
      { href: "/horarios/aula", label: "Por aula", icon: DoorOpen },
      { href: "/horarios/grupo", label: "Por grupo", icon: UsersRound },
      { href: "/asignaciones", label: "Asignaciones", icon: CalendarRange },
    ],
  },
  {
    title: "Catálogos",
    items: [
      { href: "/profesores", label: "Profesores", icon: Users },
      { href: "/aulas", label: "Aulas", icon: DoorOpen },
      { href: "/asignaturas", label: "Asignaturas", icon: BookOpen },
      { href: "/grupos", label: "Grupos", icon: UsersRound },
      { href: "/franjas", label: "Franjas horarias", icon: Clock },
      { href: "/centros", label: "Centros", icon: Building2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
          <CalendarDays className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[15px] font-bold tracking-tight">Horarios UF3</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto p-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/70">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-150",
                        active
                          ? "border-l-2 border-primary bg-primary/8 pl-[10px] font-medium text-primary"
                          : "text-foreground/75 hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t px-5 py-3">
        <p className="text-[10px] text-muted-foreground/50">v0.1 · Horarios UF3</p>
      </div>
    </aside>
  );
}
