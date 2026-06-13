import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getGuardSession } from "@/server/auth/guard";

export default async function Home() {
  const session = await getGuardSession();

  if (session) {
    redirect("/workspace");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-8 text-[var(--text)]">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1200px] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl shadow-black/20">
          <p className="mb-2 text-sm font-semibold text-[var(--primary)]">
            Acceso seguro
          </p>
          <h1 className="text-3xl font-bold">Plant Access Control</h1>
          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
            Ingrese el PIN del puesto para acceder al registro de visitantes y
            control de ingresos.
          </p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
