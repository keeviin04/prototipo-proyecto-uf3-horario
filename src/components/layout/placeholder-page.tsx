import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  sprint: string;
}

export function PlaceholderPage({ title, description, sprint }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="rounded-md bg-muted p-2">
            <Construction className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">En construcción</CardTitle>
            <CardDescription>Esta sección se implementará en {sprint}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            La estructura, base de datos y autenticación están listas (Sprint 0). El contenido
            funcional se añadirá según el plan de sprints acordado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
