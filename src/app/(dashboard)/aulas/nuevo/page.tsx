import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AulaForm } from "@/components/forms/aula-form";
import { requireEditor } from "@/lib/authz";

export default async function NuevaAulaPage() {
  await requireEditor();
  return (
    <div className="space-y-6">
      <PageHeader title="Nueva aula" description="Alta de un nuevo espacio físico" />
      <Card>
        <CardContent className="pt-6">
          <AulaForm />
        </CardContent>
      </Card>
    </div>
  );
}
