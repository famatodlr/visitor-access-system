"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface LoginResponse {
  authenticated?: boolean;
  error?: string;
}

function parseLoginResponse(value: unknown): LoginResponse {
  if (!value || typeof value !== "object") {
    return {};
  }

  const response = value as {
    authenticated?: unknown;
    error?: unknown;
  };

  return {
    authenticated:
      typeof response.authenticated === "boolean"
        ? response.authenticated
        : undefined,
    error: typeof response.error === "string" ? response.error : undefined,
  };
}

function toSpanishAuthError(message?: string): string {
  const messages: Record<string, string> = {
    "PIN is required.": "Ingrese el PIN.",
    "Invalid PIN.": "PIN inválido.",
    "Authentication is not configured.":
      "La autenticación no está configurada.",
    "Could not sign in. Please try again.":
      "No se pudo iniciar sesión. Intente nuevamente.",
  };

  return message
    ? (messages[message] ?? message)
    : "No se pudo iniciar sesión. Intente nuevamente.";
}

export function LoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });
      const body = parseLoginResponse(await response.json());

      if (!response.ok || !body.authenticated) {
        setError(toSpanishAuthError(body.error));
        return;
      }

      router.push("/workspace");
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div>
        <label
          className="block text-sm font-semibold text-[var(--text)]"
          htmlFor="guard-pin"
        >
          PIN de guardia
        </label>
        <input
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary-hover)] focus:ring-2 focus:ring-[var(--primary)]/30 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          id="guard-pin"
          inputMode="numeric"
          name="pin"
          onChange={(event) => setPin(event.target.value)}
          required
          type="password"
          value={pin}
        />
        {error ? (
          <p className="mt-2 rounded-lg border border-[var(--error)]/40 bg-[var(--error)]/10 px-3 py-2 text-sm font-medium text-[var(--error)]">
            {error}
          </p>
        ) : null}
      </div>
      <button
        className="w-full rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-secondary)]"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
