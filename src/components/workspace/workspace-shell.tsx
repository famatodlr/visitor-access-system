import type { ReactNode } from "react";

import { LogoutButton } from "./logout-button";

interface WorkspaceShellProps {
  children: ReactNode;
}

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-6 text-[var(--text)]">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[1200px] flex-col">
        <header className="print-hidden flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--primary)]">
              Puesto de guardia
            </p>
            <h1 className="mt-1 text-2xl font-bold">Plant Access Control</h1>
          </div>
          <nav
            aria-label="Acciones del puesto"
            className="flex items-center"
          >
            <LogoutButton />
          </nav>
        </header>
        <div className="flex-1 py-8">{children}</div>
      </div>
    </main>
  );
}
