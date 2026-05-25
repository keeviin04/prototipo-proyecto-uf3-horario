"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Credenciales no válidas. Comprueba el email y la contraseña.");
      return;
    }

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/";
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md animate-in fade-in-0 zoom-in-95 border-0 shadow-2xl duration-300">
      <CardHeader className="space-y-3 pb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-md">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl">Horarios UF3</CardTitle>
          <CardDescription className="mt-1">Accede con tu cuenta para gestionar los horarios</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="usuario@uf3.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="animate-in fade-in-0 slide-in-from-top-1 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive duration-200">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-5 flex items-start gap-2.5 rounded-md border-l-2 border-amber-400 bg-amber-50/60 px-3.5 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="text-xs text-muted-foreground">
            <p className="mb-1 font-semibold text-foreground">Credenciales de prueba</p>
            <p>admin@uf3.local / Admin1234!</p>
            <p>editor@uf3.local / Editor1234!</p>
            <p>viewer@uf3.local / Viewer1234!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
