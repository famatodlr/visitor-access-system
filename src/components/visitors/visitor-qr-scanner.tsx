"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  classifyQrScannerError,
  formatQrEntryTimestamp,
  normalizeScannedQrToken,
  parseQrValidationResponse,
  type QrValidationResponse,
} from "./visitor-qr-scanner-logic";

type ScannerStatus =
  | "idle"
  | "starting"
  | "scanning"
  | "validating"
  | "success"
  | "error";

interface QrScannerInstance {
  start(): Promise<void>;
  stop(): void;
  destroy(): void;
}

interface QrScannerConstructor {
  new (
    video: HTMLVideoElement,
    onDecode: (result: { data: string }) => void,
    options: {
      onDecodeError?: (error: Error | string) => void;
      preferredCamera?: "environment" | "user";
      highlightScanRegion?: boolean;
      highlightCodeOutline?: boolean;
      returnDetailedScanResult?: true;
    },
  ): QrScannerInstance;
  hasCamera(): Promise<boolean>;
}

async function readQrValidationResponse(response: Response): Promise<QrValidationResponse> {
  try {
    return parseQrValidationResponse(await response.json());
  } catch {
    return {};
  }
}

function toSpanishQrError(message?: string): string {
  const messages: Record<string, string> = {
    "Guard authentication is required.": "Debe iniciar sesión para continuar.",
    "QR token is required.": "El token QR es obligatorio.",
    "QR token must be 128 characters or fewer.":
      "El token QR debe tener 128 caracteres o menos.",
    "Could not validate QR credential. Please try again.":
      "No se pudo validar la credencial QR. Intente nuevamente.",
    "No visitor found for this QR credential.":
      "No se encontró un visitante para esta credencial QR.",
  };

  return message
    ? (messages[message] ?? message)
    : "No se pudo validar la credencial QR. Intente nuevamente.";
}

export function VisitorQrScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScannerInstance | null>(null);
  const isSubmittingRef = useRef(false);
  const lastSubmittedTokenRef = useRef<string | null>(null);

  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<QrValidationResponse | null>(null);

  function stopScanner() {
    scannerRef.current?.stop();
  }

  function destroyScanner() {
    scannerRef.current?.destroy();
    scannerRef.current = null;
  }

  useEffect(() => {
    return () => {
      destroyScanner();
    };
  }, []);

  async function submitQrToken(qrToken: string) {
    if (isSubmittingRef.current || lastSubmittedTokenRef.current === qrToken) {
      return;
    }

    isSubmittingRef.current = true;
    lastSubmittedTokenRef.current = qrToken;
    stopScanner();
    setStatus("validating");
    setMessage(null);
    setConfirmation(null);

    try {
      const response = await fetch("/api/visitors/qr/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrToken,
        }),
      });
      const body = await readQrValidationResponse(response);

      if (response.status === 404) {
        setStatus("error");
        setMessage(toSpanishQrError(body.error));
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setMessage(toSpanishQrError(body.error));
        return;
      }

      if (!body.visitor || !body.entry) {
        setStatus("error");
        setMessage("La validación terminó sin datos del visitante.");
        return;
      }

      setConfirmation(body);
      setStatus("success");
    } catch {
      setStatus("error");
      setMessage("No se pudo validar la credencial QR. Intente nuevamente.");
    } finally {
      isSubmittingRef.current = false;
    }
  }

  async function startScanner() {
    const video = videoRef.current;

    if (!video) {
      setStatus("error");
      setMessage(
        "La vista previa de la cámara todavía no está lista. Intente nuevamente.",
      );
      return;
    }

    setStatus("starting");
    setMessage(null);
    setConfirmation(null);
    lastSubmittedTokenRef.current = null;

    try {
      const { default: QrScanner } = (await import("qr-scanner")) as {
        default: QrScannerConstructor;
      };
      const hasCamera = await QrScanner.hasCamera();

      if (!hasCamera) {
        setStatus("error");
        setMessage("No se encontró una cámara en este dispositivo.");
        return;
      }

      if (!scannerRef.current) {
        scannerRef.current = new QrScanner(
          video,
          (result) => {
            const qrToken = normalizeScannedQrToken(result);

            if (!qrToken) {
              setStatus("error");
              setMessage("El código QR escaneado no contiene un token válido.");
              stopScanner();
              return;
            }

            void submitQrToken(qrToken);
          },
          {
            preferredCamera: "environment",
            highlightScanRegion: true,
            highlightCodeOutline: true,
            returnDetailedScanResult: true,
          },
        );
      }

      await scannerRef.current.start();
      setStatus("scanning");
    } catch (error) {
      setStatus("error");
      setMessage(classifyQrScannerError(error));
    }
  }

  function resetScanner() {
    lastSubmittedTokenRef.current = null;
    setConfirmation(null);
    setMessage(null);
    setStatus("idle");
  }

  const isBusy = status === "starting" || status === "validating";
  const isScanning = status === "scanning";

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-xl font-bold">Escáner</h3>

        <div className="relative mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-slate-950">
          <video
            className="aspect-video w-full object-cover"
            muted
            playsInline
            ref={videoRef}
          />
          {!isScanning && status !== "validating" ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 px-6 text-center">
              <p className="text-sm font-semibold text-white">
                Inicie el escaneo cuando la credencial esté lista.
              </p>
            </div>
          ) : null}
        </div>

        {status === "idle" ? (
          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text)]">
              Listo para escanear
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
              El escáner se detendrá después de detectar el primer código QR.
            </p>
          </div>
        ) : null}

        {status === "starting" ? (
          <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
            Iniciando cámara...
          </p>
        ) : null}

        {status === "scanning" ? (
          <p className="mt-6 rounded-lg border border-[var(--primary)]/50 bg-[var(--primary)]/10 px-4 py-3 text-sm font-semibold text-[var(--primary-hover)]">
            Escaneando credencial QR...
          </p>
        ) : null}

        {status === "validating" ? (
          <p className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)]">
            Validando credencial...
          </p>
        ) : null}

        {status === "error" && message ? (
          <div className="mt-6 rounded-lg border border-[var(--error)]/40 bg-[var(--error)]/10 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--error)]">
              {message}
            </p>
          </div>
        ) : null}

        {status === "success" && confirmation?.visitor && confirmation.entry ? (
          <div className="mt-6 rounded-lg border border-[var(--success)]/40 bg-[var(--success)]/10 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--success)]">
              Ingreso registrado
            </p>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-semibold text-[var(--text-secondary)]">
                  Visitante
                </dt>
                <dd className="mt-1 text-base font-bold text-[var(--text)]">
                  {confirmation.visitor.fullName}
                </dd>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-[var(--text-secondary)]">
                    DNI
                  </dt>
                  <dd className="mt-1 font-bold text-[var(--text)]">
                    {confirmation.visitor.dni}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-[var(--text-secondary)]">
                    Empresa
                  </dt>
                  <dd className="mt-1 font-bold text-[var(--text)]">
                    {confirmation.visitor.company}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="font-semibold text-[var(--text-secondary)]">
                  Hora de ingreso
                </dt>
                <dd className="mt-1 font-bold text-[var(--text)]">
                  {formatQrEntryTimestamp(confirmation.entry.arrivedAt)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          {status === "success" || status === "error" ? (
            <button
              className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)] sm:flex-1"
              onClick={resetScanner}
              type="button"
            >
              Escanear nuevamente
            </button>
          ) : (
            <button
              className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-secondary)] sm:flex-1"
              disabled={isBusy || isScanning}
              onClick={startScanner}
              type="button"
            >
              {status === "starting" ? "Iniciando..." : "Iniciar escáner"}
            </button>
          )}
          <Link
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-center text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)] sm:flex-1"
            href="/workspace"
          >
            Volver al panel
          </Link>
        </div>
      </section>

      <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="text-xl font-bold">Nuevo ingreso</h3>
        <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
          Escanee el código QR impreso en la credencial. Una credencial válida
          registra un nuevo ingreso para el visitante.
        </p>
      </aside>
    </div>
  );
}
