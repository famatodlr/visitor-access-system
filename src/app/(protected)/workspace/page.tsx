import Link from "next/link";

import { WORKSPACE_ACTIONS } from "@/components/workspace/workspace-actions";

export default function WorkspacePage() {
  return (
    <section>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Panel operativo
        </p>
        <h2 className="mt-2 text-2xl font-bold">Panel operativo</h2>
        <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
          Seleccione una tarea para registrar, consultar o validar accesos.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {WORKSPACE_ACTIONS.map((action) => (
          <article
            className="flex min-h-52 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
            key={action.title}
          >
            <h3 className="text-xl font-bold">{action.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {action.description}
            </p>
            <Link
              className="mt-auto inline-flex justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              href={action.href}
            >
              {action.ctaLabel}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
