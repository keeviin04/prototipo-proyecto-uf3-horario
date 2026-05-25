"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { RowActions } from "@/components/data-table/row-actions";
import { useListResource } from "@/components/data-table/use-list-resource";
import { canEdit } from "@/lib/authz";
import { ETIQUETA_TIPO_ASIGNATURA, type TipoAsignatura } from "@/lib/enums";

interface AsignaturaRow {
  id: string;
  codigo: string;
  nombre: string;
  tipo: TipoAsignatura;
  color: string;
  activo: boolean;
}

export default function AsignaturasPage() {
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

  const list = useListResource<AsignaturaRow>({ url: "/api/asignaturas" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignaturas"
        description="Asignaturas, tareas, tutorías y reuniones"
        newHref={writable ? "/asignaturas/nuevo" : undefined}
        newLabel="Nueva asignatura"
      />

      <DataTable<AsignaturaRow>
        rows={list.rows}
        loading={list.loading}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Buscar por código o nombre…"
        keyFor={(r) => r.id}
        columns={[
          {
            header: "",
            cell: (r) => (
              <span
                className="inline-block h-4 w-4 rounded"
                style={{ backgroundColor: r.color }}
                aria-label={`Color ${r.color}`}
              />
            ),
            className: "w-8",
          },
          { header: "Código", cell: (r) => <span className="font-mono text-xs">{r.codigo}</span> },
          { header: "Nombre", cell: (r) => <span className="font-medium">{r.nombre}</span> },
          { header: "Tipo", cell: (r) => ETIQUETA_TIPO_ASIGNATURA[r.tipo] },
          {
            header: "Estado",
            cell: (r) =>
              r.activo ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Activa</span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Archivada</span>
              ),
          },
        ]}
        actions={(row) => (
          <RowActions
            editHref={`/asignaturas/${row.id}/editar`}
            deleteUrl={`/api/asignaturas/${row.id}`}
            resourceLabel="asignatura"
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
