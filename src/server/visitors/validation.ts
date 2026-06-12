export type VisitorRegistrationField = "name" | "dni" | "company" | "sector" | "photoDataUrl";

export interface VisitorRegistrationInput {
  name: string;
  dni: string;
  company: string;
  sector: string;
  photoDataUrl: string;
}

export interface VisitorRegistrationValidationError {
  field: VisitorRegistrationField;
  message: string;
}

export type VisitorRegistrationValidationResult =
  | {
      ok: true;
      data: VisitorRegistrationInput;
    }
  | {
      ok: false;
      errors: VisitorRegistrationValidationError[];
    };

const FIELD_LABELS: Record<VisitorRegistrationField, string> = {
  name: "Name",
  dni: "DNI",
  company: "Company",
  sector: "Sector",
  photoDataUrl: "Photo data URL",
};

export function normalizeDni(dni: string): string {
  return dni.trim().replace(/\s+/g, "").toUpperCase();
}

function readRequiredString(
  body: Record<string, unknown>,
  field: VisitorRegistrationField,
  errors: VisitorRegistrationValidationError[],
): string {
  const value = body[field];

  if (typeof value !== "string") {
    errors.push({
      field,
      message: `${FIELD_LABELS[field]} is required.`,
    });

    return "";
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    errors.push({
      field,
      message: `${FIELD_LABELS[field]} is required.`,
    });
  }

  return trimmedValue;
}

export function parseVisitorRegistrationInput(
  body: unknown,
): VisitorRegistrationValidationResult {
  const errors: VisitorRegistrationValidationError[] = [];
  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const name = readRequiredString(payload, "name", errors);
  const dni = normalizeDni(readRequiredString(payload, "dni", errors));
  const company = readRequiredString(payload, "company", errors);
  const sector = readRequiredString(payload, "sector", errors);
  const photoDataUrl = readRequiredString(payload, "photoDataUrl", errors);

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    };
  }

  return {
    ok: true,
    data: {
      name,
      dni,
      company,
      sector,
      photoDataUrl,
    },
  };
}
