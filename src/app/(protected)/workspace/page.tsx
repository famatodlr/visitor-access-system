import Link from "next/link";

import { WORKSPACE_ACTIONS } from "@/components/workspace/workspace-actions";

export default function WorkspacePage() {
  function getActionAnchor(index: number) {
    if (index === 0) {
      return "register-visitor";
    }

    if (index === 1) {
      return "search-visitor";
    }

    return undefined;
  }

  return (
    <section>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-[var(--primary)]">
          Protected area
        </p>
        <h2 className="mt-2 text-3xl font-bold">Workspace</h2>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Start from the primary guard workflows. Register new visitors or look
          up existing visitor records before handling access.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {WORKSPACE_ACTIONS.map((action, index) => (
          <article
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
            id={getActionAnchor(index)}
            key={action.title}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold">{action.title}</h3>
              <span className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                {action.status}
              </span>
            </div>
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
              {action.description}
            </p>
            {action.href ? (
              <Link
                className="mt-6 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                href={action.href}
              >
                {action.ctaLabel}
              </Link>
            ) : (
              <button
                className="mt-6 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
                disabled
                type="button"
              >
                Available soon
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
