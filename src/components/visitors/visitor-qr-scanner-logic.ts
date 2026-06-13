export interface QrValidationVisitor {
  id: string;
  fullName: string;
  dni: string;
  company: string;
}

export interface QrValidationEntry {
  id: string;
  arrivedAt: string;
}

export interface QrValidationResponse {
  visitor?: QrValidationVisitor;
  entry?: QrValidationEntry;
  error?: string;
}

const entryDateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

function readStringField(value: unknown, field: string): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const fieldValue = (value as Record<string, unknown>)[field];

  return typeof fieldValue === "string" ? fieldValue : undefined;
}

export function normalizeScannedQrToken(result: unknown): string | null {
  const rawValue =
    typeof result === "string" ? result : readStringField(result, "data");
  const qrToken = rawValue?.trim();

  return qrToken ? qrToken : null;
}

export function parseQrValidationResponse(value: unknown): QrValidationResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const response = value as Record<string, unknown>;
  const error = typeof response.error === "string" ? response.error : undefined;
  const visitor = response.visitor;
  const entry = response.entry;
  const parsedVisitor =
    visitor && typeof visitor === "object" && !Array.isArray(visitor)
      ? {
          id: readStringField(visitor, "id"),
          fullName: readStringField(visitor, "fullName"),
          dni: readStringField(visitor, "dni"),
          company: readStringField(visitor, "company"),
        }
      : null;
  const parsedEntry =
    entry && typeof entry === "object" && !Array.isArray(entry)
      ? {
          id: readStringField(entry, "id"),
          arrivedAt: readStringField(entry, "arrivedAt"),
        }
      : null;

  return {
    ...(parsedVisitor?.id &&
    parsedVisitor.fullName &&
    parsedVisitor.dni &&
    parsedVisitor.company
      ? {
          visitor: {
            id: parsedVisitor.id,
            fullName: parsedVisitor.fullName,
            dni: parsedVisitor.dni,
            company: parsedVisitor.company,
          },
        }
      : {}),
    ...(parsedEntry?.id && parsedEntry.arrivedAt
      ? {
          entry: {
            id: parsedEntry.id,
            arrivedAt: parsedEntry.arrivedAt,
          },
        }
      : {}),
    ...(error ? { error } : {}),
  };
}

export function classifyQrScannerError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "Camera access was denied. Allow camera permission and try again.";
    }

    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "No camera was found on this device.";
    }
  }

  return "Camera access was denied or unavailable. Please try again.";
}

export function formatQrEntryTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return entryDateFormatter.format(date);
}
