"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

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
    errors[fieldError.field] = fieldError.message;
    return errors;
  }, {});
}

export function VisitorRegistrationForm() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredVisitor, setRegisteredVisitor] =
    useState<RegisteredVisitor | null>(null);

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
      setPhotoError("Camera capture is not available in this browser.");
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
        "Camera access was denied or unavailable. Upload a photo instead.",
      );
    } finally {
      setIsStartingCamera(false);
    }
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setPhotoError("Camera preview is not ready yet. Please try again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setPhotoError("Could not capture the visitor photo. Please try again.");
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

  function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    setPhotoError(null);

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Upload an image file for the visitor photo.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setPhotoError("Could not read the selected photo.");
        return;
      }

      setPhotoDataUrl(reader.result);
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        photoDataUrl: undefined,
      }));
    };

    reader.onerror = () => {
      setPhotoError("Could not read the selected photo.");
    };

    reader.readAsDataURL(file);
  }

  function resetForm() {
    stopCamera();
    setForm(emptyForm);
    setPhotoDataUrl(null);
    setFieldErrors({});
    setFormError(null);
    setPhotoError(null);
    setRegisteredVisitor(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setPhotoError(null);
    setFieldErrors({});

    if (!photoDataUrl) {
      setFieldErrors({
        photoDataUrl: "Photo is required.",
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
          body.error ?? "Could not register visitor. Please try again.",
        );
        return;
      }

      if (!body.visitor) {
        setFormError("Visitor registration completed without visitor details.");
        return;
      }

      setRegisteredVisitor(body.visitor);
      stopCamera();
    } catch {
      setFormError("Could not register visitor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredVisitor) {
    return (
      <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <p className="text-sm font-semibold text-[var(--success)]">
          Visitor registered
        </p>
        <h3 className="mt-2 text-xl font-bold">{registeredVisitor.name}</h3>
        <dl className="mt-6 grid gap-4 text-base sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-[var(--text-secondary)]">
              DNI
            </dt>
            <dd className="mt-1 font-semibold">{registeredVisitor.dni}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--text-secondary)]">
              Company
            </dt>
            <dd className="mt-1 font-semibold">{registeredVisitor.company}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--text-secondary)]">
              Sector
            </dt>
            <dd className="mt-1 font-semibold">{registeredVisitor.sector}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--text-secondary)]">
              QR token
            </dt>
            <dd className="mt-1 break-all font-semibold">
              {registeredVisitor.qrToken}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--text-secondary)]">
              Registered
            </dt>
            <dd className="mt-1 font-semibold">
              {new Date(registeredVisitor.createdAt).toLocaleString()}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-800"
            onClick={resetForm}
            type="button"
          >
            Register another visitor
          </button>
          <Link
            className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
            href="/workspace"
          >
            Return to workspace
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-xl font-bold">Visitor Information</h3>
          <div className="mt-6 grid gap-6">
            <div>
              <label
                className="block text-sm font-semibold text-[var(--text)]"
                htmlFor="visitor-name"
              >
                Name
              </label>
              <input
                autoComplete="name"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
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
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
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
                Company
              </label>
              <input
                autoComplete="organization"
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
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
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
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
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[var(--error)]">
              {formError}
            </p>
          ) : null}

          <button
            className="mt-6 w-full rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Registering..." : "Register visitor"}
          </button>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-xl font-bold">Photo Capture</h3>

          <div className="mt-6 overflow-hidden rounded-lg border border-[var(--border)] bg-slate-100">
            {photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Captured visitor"
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

          <div className="mt-6 flex flex-wrap gap-4">
            {isCameraActive ? (
              <>
                <button
                  className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-800"
                  disabled={isSubmitting}
                  onClick={capturePhoto}
                  type="button"
                >
                  Capture photo
                </button>
                <button
                  className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
                  disabled={isSubmitting}
                  onClick={stopCamera}
                  type="button"
                >
                  Stop camera
                </button>
              </>
            ) : (
              <button
                className="rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSubmitting || isStartingCamera}
                onClick={startCamera}
                type="button"
              >
                {isStartingCamera ? "Starting camera..." : "Start camera"}
              </button>
            )}

            {photoDataUrl ? (
              <button
                className="rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base font-semibold text-[var(--text)] transition hover:border-[var(--primary)]"
                disabled={isSubmitting}
                onClick={() => setPhotoDataUrl(null)}
                type="button"
              >
                Retake photo
              </button>
            ) : null}
          </div>

          <div className="mt-6">
            <label
              className="block text-sm font-semibold text-[var(--text)]"
              htmlFor="visitor-photo-upload"
            >
              Upload photo
            </label>
            <input
              accept="image/*"
              className="mt-2 w-full rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--text)] file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--text)]"
              disabled={isSubmitting}
              id="visitor-photo-upload"
              onChange={handlePhotoUpload}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </section>
      </div>
    </form>
  );
}
