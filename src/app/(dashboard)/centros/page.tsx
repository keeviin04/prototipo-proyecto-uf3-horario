"use client";

import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { Pagination } from "@/components/data-table/pagination";
import { RowActions } from "@/components/data-table/row-actions";
import { useListResource } from "@/components/data-table/use-list-resource";
import { isAdmin } from "@/lib/authz";

interface CentroRow {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string | null;
  activo: boolean;
}

export default function CentrosPage() {
  const { data: session } = useSession();
  const admin = isAdmin(
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

  const list = useListResource<CentroRow>({ url: "/api/centros" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centros"
        description="Centros educativos (solo gestionable por ADMIN)"
        newHref={admin ? "/centros/nuevo" : undefined}
        newLabel="Nuevo centro"
      />

      <DataTable<CentroRow>
        rows={list.rows}
        loading={list.loading}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Buscar por código, nombre, dirección…"
        keyFor={(r) => r.id}
        columns={[
          { header: "Código", cell: (r) => <span className="font-mono text-xs">{r.codigo}</span> },
          { header: "Nombre", cell: (r) => <span className="font-medium">{r.nombre}</span> },
          { header: "Dirección", cell: (r) => r.direccion ?? "—" },
          {
            header: "Estado",
            cell: (r) =>
              r.activo ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Activo</span>
              ) : (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Archivado</span>
              ),
          },
        ]}
        actions={(row) => (
          <RowActions
            editHref={`/centros/${row.id}/editar`}
            deleteUrl={`/api/centros/${row.id}`}
            resourceLabel="centro"
            canEdit={admin}
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
