"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { RowActions } from "@/components/data-table/row-actions";
import { useListResource } from "@/components/data-table/use-list-resource";
import { canEdit } from "@/lib/authz";
import { ETIQUETA_DIA, type DiaSemana } from "@/lib/enums";

interface AsignacionRow {
  id: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  profesor: { nombre: string; apellidos: string };
  aula: { codigo: string; nombre: string };
  asignatura: { nombre: string; color: string };
  grupo: { codigo: string; nombre: string };
}

export default function AsignacionesPage() {
  const { data: session } = useSession();
  const writable = canEdit(
    session?.user
      ? {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.name!,
          rol: session.user.rol,
          centroId: session.user.centroId,
        }
      : null,
  );

  const list = useListResource<AsignacionRow>({ url: "/api/asignaciones" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignaciones"
        description="Horario lectivo del centro"
        newHref={writable ? "/asignaciones/nuevo" : undefined}
        newLabel="Nueva asignación"
      />

      <DataTable<AsignacionRow>
        rows={list.rows}
        loading={list.loading}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Buscar por profesor, aula, asignatura o grupo…"
        keyFor={(r) => r.id}
        emptyMessage="No hay asignaciones todavía. Crea la primera."
        columns={[
          {
            header: "Día",
            cell: (r) => ETIQUETA_DIA[r.dia as DiaSemana] ?? r.dia,
          },
          {
            header: "Horario",
            cell: (r) => (
              <span className="font-mono text-xs">
                {r.horaInicio}–{r.horaFin}
              </span>
            ),
          },
          {
            header: "Profesor",
            cell: (r) => (
              <span className="font-medium">
                {r.profesor.apellidos}, {r.profesor.nombre}
              </span>
            ),
          },
          {
            header: "Aula",
            cell: (r) => (
              <span className="font-mono text-xs" title={r.aula.nombre}>
                {r.aula.codigo}
              </span>
            ),
          },
          {
            header: "Asignatura",
            cell: (r) => (
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: r.asignatura.color }}
                />
                <span className="truncate">{r.asignatura.nombre}</span>
              </div>
            ),
          },
          {
            header: "Grupo",
            cell: (r) => (
              <span className="font-mono text-xs" title={r.grupo.nombre}>
                {r.grupo.codigo}
              </span>
            ),
          },
        ]}
        actions={(row) => (
          <RowActions
            editHref={`/asignaciones/${row.id}/editar`}
            deleteUrl={`/api/asignaciones/${row.id}`}
            resourceLabel="asignación"
            canEdit={writable}
            onChange={list.refresh}
          />
        )}
      />

      <Pagination
        page={list.page}
        totalPages={list.pagination.totalPages}
        total={list.pagination.total}
        pageSize={list.pagination.pageSize}
        onPageChange={list.setPage}
      />
    </div>
  );
}
