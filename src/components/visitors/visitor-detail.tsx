"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PrintableVisitorCredential } from "./printable-visitor-credential";

interface VisitorEntry {
  id: string;
  arrivedAt: string;
}

interface VisitorDetailData {
  id: string;
  name: string;
  dni: string;
  company: string;
  sector: string;
  photoDataUrl: string;
  qrToken: string;
  createdAt: string;
  entries: VisitorEntry[];
}

interface VisitorDetailResponse {
  visitor?: VisitorDetailData;
  error?: string;
}

interface VisitorDetailProps {
  visitorId: string;
}

const entryDateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeZone: "America/Argentina/Buenos_Aires",
});

const entryTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

function parseVisitorDetailResponse(value: unknown): VisitorDetailResponse {
  if (!value || typeof value !== "object") {
    return {};
  }

  const response = value as VisitorDetailResponse;

  return {
    visitor: response.visitor,
    error: typeof response.error === "string" ? response.error : undefined,
  };
}

function toSpanishVisitorDetailError(message?: string): string {
  const messages: Record<string, string> = {
    "Guard authentication is required.": "Debe iniciar sesión para continuar.",
    "Could not load visitor details. Please try again.":
      "No se pudo cargar el visitante. Intente nuevamente.",
    "Visitor was not found.": "No se encontró el visitante.",
  };

  return message
    ? (messages[message] ?? message)
    : "No se pudo cargar el visitante. Intente nuevamente.";
}

function formatEntryDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return entryDateFormatter.format(date);
}

function formatEntryTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return entryTimeFormatter.format(date);
}

export function VisitorDetail({ visitorId }: VisitorDetailProps) {
  const [visitor, setVisitor] = useState<VisitorDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isCredentialOpen, setIsCredentialOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadVisitor() {
      setIsLoading(true);
      setError(null);
      setIsNotFound(false);

      try {
        const response = await fetch(`/api/visitors/${visitorId}`);
        const body = parseVisitorDetailResponse(await response.json());

        if (!isMounted) {
          return;
        }

        if (response.status === 404) {
          setIsNotFound(true);
          setVisitor(null);
          return;
        }

        if (!response.ok) {
          setError(toSpanishVisitorDetailError(body.error));
          setVisitor(null);
          return;
        }

        if (!body.visitor) {
          setError("La consulta terminó sin datos del visitante.");
          setVisitor(null);
          return;
        }

        setVisitor(body.visitor);
      } catch {
        if (isMounted) {
          setError("No se pudo cargar el visitante. Intente nuevamente.");
          setVisitor(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadVisitor();

    return () => {
      isMounted = false;
    };
  }, [visitorId]);

  if (isLoading) {
    return (
      <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-base font-semibold text-[var(--text-secondary)]">
          Cargando visitante...
        </p>
      </section>
    );
  }

  if (isNotFound) {
    return (
      <section className="mt-8 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-6">
        <h3 className="text-xl font-bold">No se encontró el visitante</h3>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Busque nuevamente o registre al visitante para crear una credencial.
        </p>
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <Link
            className="rounded-lg bg-[var(--primary)] px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            href="/workspace/visitors/search"
          >
            Buscar nuevamente
          </Link>
          <Link
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-center text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)]"
            href="/workspace/visitors/new"
          >
            Registrar visitante
          </Link>
        </div>
      </section>
    );
  }

  if (error || !visitor) {
    return (
      <section className="mt-8 rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 p-6">
        <h3 className="text-xl font-bold text-[var(--error)]">
          No se pudo cargar el visitante
        </h3>
        <p className="mt-4 text-base leading-7 text-[var(--error)]">
          {error ?? "No se pudo cargar el visitante. Intente nuevamente."}
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg border border-[var(--error)]/40 bg-[var(--surface-elevated)] px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)]"
          href="/workspace/visitors/search"
        >
          Volver a la búsqueda
        </Link>
      </section>
    );
  }

  if (isCredentialOpen) {
    return (
      <PrintableVisitorCredential
        onRegisterAnother={() => setIsCredentialOpen(false)}
        secondaryActionLabel="Volver al detalle"
        statusLabel="Credencial imprimible"
        title={`Credencial de ${visitor.name}`}
        visitor={visitor}
      />
    );
  }

  return (
    <div className="print-hidden mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={`Foto del visitante ${visitor.name}`}
            className="aspect-[3/4] w-full object-cover"
            src={visitor.photoDataUrl}
          />
        </div>
        <button
          className="mt-6 w-full rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)]"
          onClick={() => setIsCredentialOpen(true)}
          type="button"
        >
          Abrir credencial imprimible
        </button>
        <Link
          className="mt-4 inline-flex w-full justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)]"
          href="/workspace/visitors/search"
        >
          Buscar otro visitante
        </Link>
      </section>

      <div className="grid gap-6">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">
            Visitante
          </p>
          <h3 className="mt-2 break-words text-3xl font-bold">
            {visitor.name}
          </h3>

          <dl className="mt-6 grid gap-4 text-base sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-[var(--text-secondary)]">
                DNI
              </dt>
              <dd className="mt-1 font-bold">{visitor.dni}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-[var(--text-secondary)]">
                Empresa
              </dt>
              <dd className="mt-1 font-bold">{visitor.company}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-semibold text-[var(--text-secondary)]">
                Sector
              </dt>
              <dd className="mt-1 font-bold">{visitor.sector}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-xl font-bold">Historial de ingresos</h3>

          {visitor.entries.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {visitor.entries.map((entry) => (
                <article
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3"
                  key={entry.id}
                >
                  <p className="text-base font-bold">
                    {formatEntryDate(entry.arrivedAt)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {formatEntryTime(entry.arrivedAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
              No hay ingresos registrados para este visitante.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
