import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CentroForm } from "@/components/forms/centro-form";
import { requireAdmin } from "@/lib/authz";

export default async function NuevoCentroPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo centro" description="Alta de un centro educativo" />
      <Card>
        <CardContent className="pt-6">
          <CentroForm />
        </CardContent>
      </Card>
    </div>
  );
}
