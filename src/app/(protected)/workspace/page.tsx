import Link from "next/link";

import { WORKSPACE_ACTIONS } from "@/components/workspace/workspace-actions";

type WorkspaceIconName = "register" | "search" | "qr";

function getWorkspaceIconName(href: string): WorkspaceIconName {
  if (href.includes("/visitors/search")) {
    return "search";
  }

  if (href.includes("/visitors/qr/validate")) {
    return "qr";
  }

  return "register";
}

function WorkspaceActionIcon({ name }: { name: WorkspaceIconName }) {
  if (name === "search") {
    return (
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <path d="M7 4h7l4 4v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" />
        <path d="M14 4v4h4" />
        <path d="m14.5 15.5 2 2" />
        <circle cx="11.5" cy="12.5" r="3" />
      </svg>
    );
  }

  if (name === "qr") {
    return (
      <svg
        aria-hidden="true"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <path d="M5 5h5v5H5z" />
        <path d="M14 5h5v5h-5z" />
        <path d="M5 14h5v5H5z" />
        <path d="M14 15h2v2h-2z" />
        <path d="M18 14h1v5h-3" />
        <path d="m13 20 2 2 5-5" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d="M15 19a6 6 0 0 0-12 0" />
      <circle cx="9" cy="8" r="4" />
      <path d="M19 8v6" />
      <path d="M16 11h6" />
    </svg>
  );
}

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
            className="flex min-h-60 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
            key={action.title}
          >
            <h3 className="text-xl font-bold">{action.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {action.description}
            </p>
            <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
              <WorkspaceActionIcon name={getWorkspaceIconName(action.href)} />
            </div>
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
