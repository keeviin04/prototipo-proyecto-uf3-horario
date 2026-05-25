"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";

interface RowActionsProps {
  /** URL de edición, p.ej. `/profesores/abc/editar`. */
  editHref: string;
  /** URL de la API para borrar, p.ej. `/api/profesores/abc`. */
  deleteUrl: string;
  /** Etiqueta del recurso para los mensajes (singular: "profesor", "aula"…). */
  resourceLabel: string;
  /** Si la acción la permite el usuario (rol). */
  canEdit?: boolean;
  /** Callback cuando se completa una acción para refrescar la lista. */
  onChange?: () => void;
}

export function RowActions({
  editHref,
  deleteUrl,
  resourceLabel,
  canEdit = true,
  onChange,
}: RowActionsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await apiClient.delete<{ deleted: boolean; archived: boolean }>(deleteUrl);
      if (result.archived) {
        toast({
          title: `${capitalize(resourceLabel)} archivado`,
          description: `Tenía registros relacionados; se ha desactivado en lugar de borrarse.`,
          variant: "success",
        });
      } else {
        toast({ title: `${capitalize(resourceLabel)} eliminado`, variant: "success" });
      }
      setConfirmOpen(false);
      onChange?.();
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Error al borrar.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  }

  if (!canEdit) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-muted"
            aria-label="Acciones"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={editHref} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Eliminar ${resourceLabel}`}
        description={`¿Seguro que quieres eliminar este ${resourceLabel}? Si tiene registros relacionados, se archivará automáticamente.`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
