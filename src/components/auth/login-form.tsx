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
        setError(body.error ?? "Could not sign in. Please try again.");
        return;
      }

      router.push("/workspace");
      router.refresh();
    } catch {
      setError("Could not sign in. Please try again.");
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
          Guard PIN
        </label>
        <input
          autoComplete="current-password"
          className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
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
          <p className="mt-2 text-sm font-medium text-[var(--error)]">
            {error}
          </p>
        ) : null}
      </div>
      <button
        className="w-full rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
