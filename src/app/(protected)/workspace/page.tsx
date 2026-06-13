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
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M6 4h8l4 4v12H6z" />
        <path d="M14 4v4h4" />
        <path d="M9 11h4" />
        <path d="M9 15h2" />
        <circle cx="16" cy="16" r="3" />
        <path d="m18.5 18.5 2 2" />
      </svg>
    );
  }

  if (name === "qr") {
    return (
      <svg
        aria-hidden="true"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M5 9V5h4" />
        <path d="M15 5h4v4" />
        <path d="M19 15v4h-4" />
        <path d="M9 19H5v-4" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
        <path d="m14 17 2 2 4-5" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2" width="16" x="4" y="5" />
      <circle cx="10" cy="12" r="2.5" />
      <path d="M14 10h3" />
      <path d="M14 14h2" />
      <path d="M18 15v4" />
      <path d="M16 17h4" />
    </svg>
  );
}

export default function WorkspacePage() {
  return (
    <section>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Panel operativo
        </p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Panel operativo
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
          Seleccione una tarea para registrar, consultar o validar accesos.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {WORKSPACE_ACTIONS.map((action) => (
          <article
            className="flex min-h-72 flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center"
            key={action.title}
          >
            <h3 className="text-2xl font-bold">{action.title}</h3>
            <p className="mt-3 text-base leading-7 text-[var(--text-secondary)]">
              {action.description}
            </p>
            <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)]">
              <WorkspaceActionIcon name={getWorkspaceIconName(action.href)} />
            </div>
            <Link
              className="mt-auto inline-flex w-full justify-center rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:ring-offset-2 focus:ring-offset-[var(--surface)]"
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
