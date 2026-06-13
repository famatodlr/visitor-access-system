"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface VisitorSearchResponse {
  visitor?: {
    id: string;
    name: string;
    dni: string;
    company: string;
    sector: string;
    createdAt: string;
  };
  error?: string;
  fields?: Array<{
    field: "dni";
    message: string;
  }>;
}

function parseVisitorSearchResponse(value: unknown): VisitorSearchResponse {
  if (!value || typeof value !== "object") {
    return {};
  }

  const response = value as VisitorSearchResponse;

  return {
    visitor: response.visitor,
    error: typeof response.error === "string" ? response.error : undefined,
    fields: Array.isArray(response.fields) ? response.fields : undefined,
  };
}

export function VisitorSearch() {
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [wasNotFound, setWasNotFound] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(null);
    setFormError(null);
    setWasNotFound(false);

    if (dni.trim().length === 0) {
      setFieldError("DNI is required.");
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `/api/visitors/search?dni=${encodeURIComponent(dni)}`,
      );
      const body = parseVisitorSearchResponse(await response.json());

      if (response.status === 404) {
        setWasNotFound(true);
        return;
      }

      if (!response.ok) {
        const dniError = body.fields?.find((field) => field.field === "dni");
        setFieldError(dniError?.message ?? null);
        setFormError(body.error ?? "Could not search visitors. Please try again.");
        return;
      }

      if (!body.visitor) {
        setFormError("Visitor search completed without visitor details.");
        return;
      }

      router.push(`/workspace/visitors/${body.visitor.id}`);
    } catch {
      setFormError("Could not search visitors. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-xl font-bold">Search by DNI</h3>
        <form className="mt-6" onSubmit={handleSubmit}>
          <label
            className="block text-sm font-semibold text-[var(--text)]"
            htmlFor="visitor-search-dni"
          >
            DNI
          </label>
          <input
            autoComplete="off"
            className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            disabled={isSearching}
            id="visitor-search-dni"
            name="dni"
            onChange={(event) => {
              setDni(event.target.value);
              setFieldError(null);
              setFormError(null);
              setWasNotFound(false);
            }}
            type="text"
            value={dni}
          />
          {fieldError ? (
            <p className="mt-2 text-sm font-medium text-[var(--error)]">
              {fieldError}
            </p>
          ) : null}

          {formError ? (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[var(--error)]">
              {formError}
            </p>
          ) : null}

          {wasNotFound ? (
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-[var(--text)]">
                No visitor found for this DNI.
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                Register the visitor to create their first access credential.
              </p>
              <Link
                className="mt-4 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                href="/workspace/visitors/new"
              >
                Register visitor
              </Link>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <button
              className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:flex-1"
              disabled={isSearching}
              type="submit"
            >
              {isSearching ? "Searching..." : "Search visitor"}
            </button>
            <Link
              className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-center text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary)] sm:flex-1"
              href="/workspace"
            >
              Return to workspace
            </Link>
          </div>
        </form>
      </section>

      <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-xl font-bold">Lookup</h3>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Enter the DNI exactly as presented. Spaces are normalized before the
          search, matching visitor registration.
        </p>
      </aside>
    </div>
  );
}
