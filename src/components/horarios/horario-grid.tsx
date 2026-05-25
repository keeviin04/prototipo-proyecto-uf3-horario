"use client";

import { Printer } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { horaAMinutos } from "@/lib/validations/comun";
import { ETIQUETA_DIA, type DiaSemana } from "@/lib/enums";

export interface AsignacionCelda {
  id: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  asignatura: { nombre: string; color: string };
  profesor: { nombre: string; apellidos: string };
  aula: { codigo: string };
  grupo: { codigo: string; nombre: string };
  observaciones: string | null;
}

interface HorarioGridProps {
  asignaciones: AsignacionCelda[];
  /** Texto descriptivo que se muestra al imprimir (nombre del profesor, aula o grupo). */
  titulo?: string;
  /** Qué campo secundario mostrar en cada celda cuando el espacio es limitado. */
  secundario?: "profesor" | "aula" | "grupo";
}

// Días lectivos en orden correcto
const DIAS_LABORABLES: DiaSemana[] = [
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
];

const PX_POR_MIN = 1.5; // escala vertical: 1.5 px/min = 90 px/hora
const TIME_COL_W = 52;  // ancho columna de horas (px)

interface LayoutEntry {
  /** Índice de columna (0-based) dentro del grupo de solapamiento. */
  col: number;
  /** Total de columnas en el grupo de solapamiento. */
  cols: number;
}

/**
 * Calcula la distribución horizontal de eventos solapados (estilo Google Calendar).
 *
 * Paso 1 — asignación greedy de columnas:
 *   Para cada evento ordenado por inicio, busca la primera columna libre
 *   (cuyo evento anterior ya terminó) y se la asigna.
 *
 * Paso 2 — ancho de columna:
 *   El número total de columnas de un evento es el índice máximo entre
 *   todos los eventos que se solapan con él + 1.
 */
function calcularLayout(events: AsignacionCelda[]): Map<string, LayoutEntry> {
  const result = new Map<string, LayoutEntry>();
  if (events.length === 0) return result;

  const sorted = [...events].sort(
    (a, b) => horaAMinutos(a.horaInicio) - horaAMinutos(b.horaInicio),
  );

  // Paso 1: asignar columna greedy
  const colEndTimes: number[] = [];
  const assigned = new Map<string, number>();

  for (const ev of sorted) {
    const start = horaAMinutos(ev.horaInicio);
    const end = horaAMinutos(ev.horaFin);
    let col = colEndTimes.findIndex((t) => t <= start);
    if (col === -1) {
      col = colEndTimes.length;
      colEndTimes.push(end);
    } else {
      colEndTimes[col] = end;
    }
    assigned.set(ev.id, col);
  }

  // Paso 2: calcular cols para cada evento
  for (const ev of sorted) {
    const start = horaAMinutos(ev.horaInicio);
    const end = horaAMinutos(ev.horaFin);
    const col = assigned.get(ev.id)!;
    let maxCol = col;

    for (const other of sorted) {
      if (other.id === ev.id) continue;
      const oStart = horaAMinutos(other.horaInicio);
      const oEnd = horaAMinutos(other.horaFin);
      if (oStart < end && oEnd > start) {
        const otherCol = assigned.get(other.id)!;
        if (otherCol > maxCol) maxCol = otherCol;
      }
    }

    result.set(ev.id, { col, cols: maxCol + 1 });
  }

  return result;
}

function minToHora(min: number): string {
  return `${Math.floor(min / 60).toString().padStart(2, "0")}:${(min % 60).toString().padStart(2, "0")}`;
}

export function HorarioGrid({ asignaciones, titulo, secundario }: HorarioGridProps) {
  // Calcular rango horario a partir de los datos reales.
  // Fallback a 08:00-15:00 cuando no hay asignaciones.
  let minMin = 8 * 60;
  let maxMin = 15 * 60;

  for (const a of asignaciones) {
    const ini = horaAMinutos(a.horaInicio);
    const fin = horaAMinutos(a.horaFin);
    if (ini < minMin) minMin = ini;
    if (fin > maxMin) maxMin = fin;
  }

  // Redondear a la hora más cercana
  minMin = Math.floor(minMin / 60) * 60;
  maxMin = Math.ceil(maxMin / 60) * 60;

  const totalMin = maxMin - minMin;
  const gridHeight = totalMin * PX_POR_MIN;

  // Marcadores de hora completa
  const horas: number[] = [];
  for (let m = minMin; m <= maxMin; m += 60) horas.push(m);

  // Marcadores de media hora (solo las intermedias)
  const medias: number[] = [];
  for (let m = minMin + 30; m < maxMin; m += 60) medias.push(m);

  // Asignaciones agrupadas por día
  const porDia: Record<string, AsignacionCelda[]> = {};
  for (const d of DIAS_LABORABLES) {
    porDia[d] = asignaciones.filter((a) => a.dia === d);
  }

  function toY(hora: string) {
    return (horaAMinutos(hora) - minMin) * PX_POR_MIN;
  }

  function toH(a: AsignacionCelda) {
    return (horaAMinutos(a.horaFin) - horaAMinutos(a.horaInicio)) * PX_POR_MIN;
  }

  function labelSecundario(a: AsignacionCelda): string {
    if (secundario === "aula") return a.aula.codigo;
    if (secundario === "grupo") return a.grupo.codigo;
    // por defecto (vista semanal): apellido del profesor
    return a.profesor.apellidos.split(" ")[0];
  }

  const tooltipCompleto = (a: AsignacionCelda) =>
    [
      a.asignatura.nombre,
      `${a.profesor.apellidos}, ${a.profesor.nombre}`,
      `Aula: ${a.aula.codigo}`,
      `Grupo: ${a.grupo.codigo} (${a.grupo.nombre})`,
      `${a.horaInicio}–${a.horaFin}`,
      a.observaciones ?? "",
    ]
      .filter(Boolean)
      .join("\n");

  return (
    <div>
      {/* Toolbar — oculto al imprimir */}
      <div className="no-print mb-4 flex items-center justify-between gap-2">
        {titulo && <p className="text-sm text-muted-foreground">{titulo}</p>}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-2"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Imprimir / PDF
        </Button>
      </div>

      {/* Cabecera de impresión — visible solo al imprimir */}
      {titulo && (
        <div className="mb-4 hidden text-center print:block">
          <h2 className="text-lg font-bold">{titulo}</h2>
        </div>
      )}

      {/* Cuadrícula */}
      <div className="horario-grid overflow-x-auto rounded-lg border bg-card">
        <div className="flex" style={{ minWidth: 560 }}>
          {/* Columna de horas */}
          <div className="shrink-0 border-r" style={{ width: TIME_COL_W }}>
            <div className="border-b bg-muted/50 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Hora
            </div>
            <div className="relative" style={{ height: gridHeight }}>
              {horas.map((m) => (
                <span
                  key={m}
                  className="absolute right-2 tabular-nums text-[11px] text-muted-foreground"
                  style={{ top: (m - minMin) * PX_POR_MIN - 8 }}
                >
                  {minToHora(m)}
                </span>
              ))}
            </div>
          </div>

          {/* Columnas de días */}
          {DIAS_LABORABLES.map((dia, diaIdx) => {
            const layout = calcularLayout(porDia[dia]);
            return (
              <div
                key={dia}
                className={`min-w-0 flex-1 border-l first:border-l-0 ${diaIdx % 2 === 1 ? "bg-muted/[0.03]" : ""}`}
              >
                <div className="border-b bg-muted/50 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                  {ETIQUETA_DIA[dia]}
                </div>
                <div className="relative" style={{ height: gridHeight }}>
                  {/* Líneas de hora completa */}
                  {horas.map((m) => (
                    <div
                      key={m}
                      className="absolute w-full border-t border-border/50"
                      style={{ top: (m - minMin) * PX_POR_MIN }}
                    />
                  ))}

                  {/* Líneas de media hora (más tenues, punteadas) */}
                  {medias.map((m) => (
                    <div
                      key={m}
                      className="absolute w-full border-t border-dashed border-border/25"
                      style={{ top: (m - minMin) * PX_POR_MIN }}
                    />
                  ))}

                  {/* Asignaciones con layout de solapamiento */}
                  {porDia[dia].map((a, idx) => {
                    const { col, cols } = layout.get(a.id)!;
                    const colPct = 100 / cols;
                    const top = toY(a.horaInicio);
                    const height = Math.max(toH(a) - 2, 18);

                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, scaleY: 0.85 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{
                          duration: 0.18,
                          ease: "easeOut",
                          delay: idx * 0.03,
                        }}
                        className="absolute overflow-hidden rounded-md border-l-[3px] px-1.5 py-0.5 shadow-sm ring-1 ring-inset ring-black/5 transition-all duration-100 hover:brightness-[0.92] hover:shadow-md"
                        style={{
                          top: top + 1,
                          height,
                          left: `calc(${col * colPct}% + 2px)`,
                          width: `calc(${colPct}% - 4px)`,
                          borderLeftColor: a.asignatura.color,
                          backgroundColor: `${a.asignatura.color}20`,
                          transformOrigin: "top",
                          cursor: "default",
                        }}
                        title={tooltipCompleto(a)}
                      >
                        <p
                          className="truncate text-xs font-semibold leading-tight"
                          style={{ color: a.asignatura.color }}
                        >
                          {a.asignatura.nombre}
                        </p>
                        {height > 38 && (
                          <p className="truncate text-xs leading-tight text-muted-foreground">
                            {labelSecundario(a)}
                          </p>
                        )}
                        {height > 56 && (
                          <p className="truncate text-xs leading-tight text-muted-foreground">
                            {a.horaInicio}–{a.horaFin}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leyenda de asignaturas */}
      {asignaciones.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ...new Map(
              asignaciones.map((a) => [a.asignatura.nombre, a.asignatura]),
            ).values(),
          ].map((s) => (
            <div
              key={s.nombre}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{
                backgroundColor: `${s.color}18`,
                color: s.color,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
