import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AsignacionForm } from "@/components/forms/asignacion-form";
import { requireEditor } from "@/lib/authz";

export default async function NuevaAsignacionPage() {
  await requireEditor();
  return (
    <div className="space-y-6">
      <PageHeader title="Nueva asignación" description="Alta de una asignación horaria" />
      <Card>
        <CardContent className="pt-6">
          <AsignacionForm />
        </CardContent>
      </Card>
    </div>
  );
}
