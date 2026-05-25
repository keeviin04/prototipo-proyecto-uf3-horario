"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { RowActions } from "@/components/data-table/row-actions";
import { useListResource } from "@/components/data-table/use-list-resource";
import { canEdit } from "@/lib/authz";

interface FranjaRow {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  orden: number;
  activo: boolean;
}

export default function FranjasPage() {
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

  const list = useListResource<FranjaRow>({ url: "/api/franjas" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Franjas horarias"
        description="Plantillas opcionales para agilizar la creación de asignaciones"
        newHref={writable ? "/franjas/nuevo" : undefined}
        newLabel="Nueva franja"
      />

      <DataTable<FranjaRow>
        rows={list.rows}
        loading={list.loading}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Buscar por nombre…"
        keyFor={(r) => r.id}
        columns={[
          { header: "Orden", cell: (r) => r.orden, className: "w-16" },
          { header: "Nombre", cell: (r) => <span className="font-medium">{r.nombre}</span> },
          { header: "Inicio", cell: (r) => <span className="font-mono">{r.horaInicio}</span> },
          { header: "Fin", cell: (r) => <span className="font-mono">{r.horaFin}</span> },
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
            editHref={`/franjas/${row.id}/editar`}
            deleteUrl={`/api/franjas/${row.id}`}
            resourceLabel="franja"
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
