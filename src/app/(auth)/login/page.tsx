import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        backgroundColor: "hsl(210 40% 98%)",
        backgroundImage:
          "radial-gradient(hsl(214 32% 85%) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
