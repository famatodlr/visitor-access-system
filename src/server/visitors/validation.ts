export type VisitorRegistrationField = "name" | "dni" | "company" | "sector" | "photoDataUrl";
export type VisitorDniSearchField = "dni";
export type VisitorQrValidationField = "qrToken";

const DNI_SEARCH_LENGTH_ERROR = "DNI must contain 7 or 8 digits.";
const DNI_SEARCH_PATTERN = /^\d{7,8}$/;
const QR_TOKEN_MAX_LENGTH = 128;

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

export interface VisitorDniSearchInput {
  dni: string;
}

export interface VisitorDniSearchValidationError {
  field: VisitorDniSearchField;
  message: string;
}

export interface VisitorQrValidationInput {
  qrToken: string;
}

export interface VisitorQrValidationError {
  field: VisitorQrValidationField;
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

export type VisitorDniSearchValidationResult =
  | {
      ok: true;
      data: VisitorDniSearchInput;
    }
  | {
      ok: false;
      errors: VisitorDniSearchValidationError[];
    };

export type VisitorQrValidationResult =
  | {
      ok: true;
      data: VisitorQrValidationInput;
    }
  | {
      ok: false;
      errors: VisitorQrValidationError[];
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

export function parseVisitorDniSearchInput(body: unknown): VisitorDniSearchValidationResult {
  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const dni = payload.dni;

  if (typeof dni !== "string" || dni.trim().length === 0) {
    return {
      ok: false,
      errors: [
        {
          field: "dni",
          message: "DNI is required.",
        },
      ],
    };
  }

  const normalizedDni = dni.replace(/\s+/g, "");

  if (!DNI_SEARCH_PATTERN.test(normalizedDni)) {
    return {
      ok: false,
      errors: [
        {
          field: "dni",
          message: DNI_SEARCH_LENGTH_ERROR,
        },
      ],
    };
  }

  return {
    ok: true,
    data: {
      dni: normalizedDni,
    },
  };
}

export function parseVisitorQrValidationInput(body: unknown): VisitorQrValidationResult {
  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const qrToken = payload.qrToken;

  if (typeof qrToken !== "string" || qrToken.trim().length === 0) {
    return {
      ok: false,
      errors: [
        {
          field: "qrToken",
          message: "QR token is required.",
        },
      ],
    };
  }

  const normalizedQrToken = qrToken.trim();

  if (normalizedQrToken.length > QR_TOKEN_MAX_LENGTH) {
    return {
      ok: false,
      errors: [
        {
          field: "qrToken",
          message: "QR token must be 128 characters or fewer.",
        },
      ],
    };
  }

  return {
    ok: true,
    data: {
      qrToken: normalizedQrToken,
    },
  };
}
