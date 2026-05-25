"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { RowActions } from "@/components/data-table/row-actions";
import { useListResource } from "@/components/data-table/use-list-resource";
import { canEdit } from "@/lib/authz";

interface ProfesorRow {
  id: string;
  codigo: string;
  nombre: string;
  apellidos: string;
  email: string | null;
  departamento: string | null;
  activo: boolean;
}

export default function ProfesoresPage() {
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

  const list = useListResource<ProfesorRow>({ url: "/api/profesores" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profesores"
        description="Personal docente del centro"
        newHref={writable ? "/profesores/nuevo" : undefined}
        newLabel="Nuevo profesor"
      />

      <DataTable<ProfesorRow>
        rows={list.rows}
        loading={list.loading}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Buscar por código, nombre, apellidos…"
        keyFor={(r) => r.id}
        columns={[
          { header: "Código", cell: (r) => <span className="font-mono text-xs">{r.codigo}</span> },
          {
            header: "Nombre",
            cell: (r) => (
              <span className="font-medium">
                {r.apellidos}, {r.nombre}
              </span>
            ),
          },
          { header: "Email", cell: (r) => r.email ?? "—" },
          { header: "Departamento", cell: (r) => r.departamento ?? "—" },
          {
            header: "Estado",
            cell: (r) =>
              r.activo ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                  Activo
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  Archivado
                </span>
              ),
          },
        ]}
        actions={(row) => (
          <RowActions
            editHref={`/profesores/${row.id}/editar`}
            deleteUrl={`/api/profesores/${row.id}`}
            resourceLabel="profesor"
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
