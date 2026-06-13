"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { PrintableVisitorCredential } from "./printable-visitor-credential";

type VisitorRegistrationField =
  | "name"
  | "dni"
  | "company"
  | "sector"
  | "photoDataUrl";

interface VisitorRegistrationPayload {
  name: string;
  dni: string;
  company: string;
  sector: string;
  photoDataUrl: string;
}

interface RegisteredVisitor {
  id: string;
  name: string;
  dni: string;
  company: string;
  sector: string;
  qrToken: string;
  createdAt: string;
}

type RegisteredVisitorCredential = RegisteredVisitor & {
  photoDataUrl: string;
};

interface VisitorRegistrationResponse {
  visitor?: RegisteredVisitor;
  error?: string;
  fields?: Array<{
    field: VisitorRegistrationField;
    message: string;
  }>;
}

type FieldErrors = Partial<Record<VisitorRegistrationField, string>>;

const emptyForm: Omit<VisitorRegistrationPayload, "photoDataUrl"> = {
  name: "",
  dni: "",
  company: "",
  sector: "",
};

function parseVisitorRegistrationResponse(
  value: unknown,
): VisitorRegistrationResponse {
  if (!value || typeof value !== "object") {
    return {};
  }

  const response = value as VisitorRegistrationResponse;

  return {
    visitor: response.visitor,
    error: typeof response.error === "string" ? response.error : undefined,
    fields: Array.isArray(response.fields) ? response.fields : undefined,
  };
}

function fieldErrorsFromResponse(
  fields: VisitorRegistrationResponse["fields"],
): FieldErrors {
  return (fields ?? []).reduce<FieldErrors>((errors, fieldError) => {
    errors[fieldError.field] = toSpanishRegistrationFieldError(
      fieldError.message,
    );
    return errors;
  }, {});
}

function toSpanishRegistrationFieldError(message: string): string {
  const messages: Record<string, string> = {
    "Name is required.": "Ingrese el nombre.",
    "DNI is required.": "Ingrese el DNI.",
    "DNI must contain 7 or 8 digits.": "El DNI debe tener 7 u 8 dígitos.",
    "Company is required.": "Ingrese la empresa.",
    "Sector is required.": "Ingrese el sector.",
    "Photo data URL is required.": "Capture una foto con la cámara.",
  };

  return messages[message] ?? message;
}

function toSpanishRegistrationError(message?: string): string {
  const messages: Record<string, string> = {
    "Guard authentication is required.": "Debe iniciar sesión para continuar.",
    "Visitor registration payload is invalid.":
      "Revise los datos del visitante antes de registrar.",
    "Could not register visitor. Please try again.":
      "No se pudo registrar el visitante. Intente nuevamente.",
    "A visitor with this DNI already exists.":
      "Ya existe un visitante registrado con este DNI.",
    "Could not generate a unique visitor credential. Please try again.":
      "No se pudo generar la credencial. Intente nuevamente.",
  };

  return message
    ? (messages[message] ?? message)
    : "No se pudo registrar el visitante. Intente nuevamente.";
}

export function VisitorRegistrationForm() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredVisitorCredential, setRegisteredVisitorCredential] =
    useState<RegisteredVisitorCredential | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  async function startCamera() {
    setPhotoError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPhotoError(
        "La captura con cámara no está disponible en este navegador.",
      );
      return;
    }

    setIsStartingCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsCameraActive(true);
    } catch {
      setPhotoError(
        "No se pudo acceder a la cámara. Habilite el permiso para capturar la foto del visitante.",
      );
    } finally {
      setIsStartingCamera(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setPhotoError(
        "La vista previa de la cámara todavía no está lista. Intente nuevamente.",
      );
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setPhotoError("No se pudo capturar la foto. Intente nuevamente.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoDataUrl(canvas.toDataURL("image/jpeg", 0.86));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      photoDataUrl: undefined,
    }));
    setPhotoError(null);
    stopCamera();
  }

  function resetForm() {
    stopCamera();
    setForm(emptyForm);
    setPhotoDataUrl(null);
    setFieldErrors({});
    setFormError(null);
    setPhotoError(null);
    setRegisteredVisitorCredential(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPhotoError(null);
    setFieldErrors({});

    if (!photoDataUrl) {
      setFieldErrors({
        photoDataUrl: "Capture una foto con la cámara.",
      });
      return;
    }

    const payload: VisitorRegistrationPayload = {
      name: form.name.trim(),
      dni: form.dni.trim(),
      company: form.company.trim(),
      sector: form.sector.trim(),
      photoDataUrl,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = parseVisitorRegistrationResponse(await response.json());

      if (!response.ok) {
        setFieldErrors(fieldErrorsFromResponse(body.fields));
        setFormError(
          toSpanishRegistrationError(body.error),
        );
        return;
      }

      if (!body.visitor) {
        setFormError("El registro terminó sin datos del visitante.");
        return;
      }

      setRegisteredVisitorCredential({
        ...body.visitor,
        photoDataUrl,
      });
      stopCamera();
    } catch {
      setFormError("No se pudo registrar el visitante. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredVisitorCredential) {
    return (
      <>
        <PrintableVisitorCredential
          onRegisterAnother={resetForm}
          visitor={registeredVisitorCredential}
        />
        <div className="print-hidden mt-6">
          <Link
            className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)]"
            href="/workspace"
          >
            Volver al panel
          </Link>
        </div>
      </>
    );
  }

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-xl font-bold">Datos del visitante</h3>
          <div className="mt-6 grid gap-6">
            <div>
              <label
                className="block text-sm font-semibold text-[var(--text)]"
                htmlFor="visitor-name"
              >
                Nombre
              </label>
              <input
                autoComplete="name"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary-hover)] focus:ring-2 focus:ring-[var(--primary)]/30 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                id="visitor-name"
                name="name"
                onChange={(event) => updateField("name", event.target.value)}
                required
                type="text"
                value={form.name}
              />
              {fieldErrors.name ? (
                <p className="mt-2 text-sm font-medium text-[var(--error)]">
                  {fieldErrors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-[var(--text)]"
                htmlFor="visitor-dni"
              >
                DNI
              </label>
              <input
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary-hover)] focus:ring-2 focus:ring-[var(--primary)]/30 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                id="visitor-dni"
                name="dni"
                onChange={(event) => updateField("dni", event.target.value)}
                required
                type="text"
                value={form.dni}
              />
              {fieldErrors.dni ? (
                <p className="mt-2 text-sm font-medium text-[var(--error)]">
                  {fieldErrors.dni}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-[var(--text)]"
                htmlFor="visitor-company"
              >
                Empresa
              </label>
              <input
                autoComplete="organization"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary-hover)] focus:ring-2 focus:ring-[var(--primary)]/30 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                id="visitor-company"
                name="company"
                onChange={(event) =>
                  updateField("company", event.target.value)
                }
                required
                type="text"
                value={form.company}
              />
              {fieldErrors.company ? (
                <p className="mt-2 text-sm font-medium text-[var(--error)]">
                  {fieldErrors.company}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-[var(--text)]"
                htmlFor="visitor-sector"
              >
                Sector
              </label>
              <input
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary-hover)] focus:ring-2 focus:ring-[var(--primary)]/30 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                id="visitor-sector"
                name="sector"
                onChange={(event) => updateField("sector", event.target.value)}
                required
                type="text"
                value={form.sector}
              />
              {fieldErrors.sector ? (
                <p className="mt-2 text-sm font-medium text-[var(--error)]">
                  {fieldErrors.sector}
                </p>
              ) : null}
            </div>
          </div>

          {formError ? (
            <p className="mt-6 rounded-lg border border-[var(--error)]/40 bg-[var(--error)]/10 px-4 py-3 text-sm font-medium text-[var(--error)]">
              {formError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <button
              className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-secondary)] sm:flex-1"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Registrando..." : "Registrar visitante"}
            </button>
            <Link
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-center text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)] sm:flex-1"
              href="/workspace"
            >
              Volver al panel
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-xl font-bold">Captura de foto</h3>

          <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
            {photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Foto capturada del visitante"
                className="aspect-[4/3] w-full object-cover"
                src={photoDataUrl}
              />
            ) : (
              <video
                autoPlay
                className="aspect-[4/3] w-full object-cover"
                muted
                playsInline
                ref={videoRef}
              />
            )}
          </div>

          {fieldErrors.photoDataUrl ? (
            <p className="mt-2 text-sm font-medium text-[var(--error)]">
              {fieldErrors.photoDataUrl}
            </p>
          ) : null}
          {photoError ? (
            <p className="mt-2 text-sm font-medium text-[var(--error)]">
              {photoError}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {isCameraActive ? (
              <>
                <button
                  className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-secondary)] sm:flex-1"
                  disabled={isSubmitting}
                  onClick={capturePhoto}
                  type="button"
                >
                  Capturar foto
                </button>
                <button
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70 sm:flex-1"
                  disabled={isSubmitting}
                  onClick={stopCamera}
                  type="button"
                >
                  Detener cámara
                </button>
              </>
            ) : (
              <button
                className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-secondary)] sm:flex-1"
                disabled={isSubmitting || isStartingCamera}
                onClick={startCamera}
                type="button"
              >
                {isStartingCamera ? "Iniciando cámara..." : "Iniciar cámara"}
              </button>
            )}

            {photoDataUrl ? (
              <button
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary-hover)] hover:text-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-70 sm:flex-1"
                disabled={isSubmitting}
                onClick={() => setPhotoDataUrl(null)}
                type="button"
              >
                Tomar otra foto
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </form>
  );
}
