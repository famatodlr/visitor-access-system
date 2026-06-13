const DNI_DIGIT_PATTERN = /^\d{7,8}$/;

export const VISITOR_SEARCH_DNI_LENGTH_ERROR = "DNI must contain 7 or 8 digits.";
export const VISITOR_SEARCH_DNI_REQUIRED_ERROR = "DNI is required.";

export function sanitizeVisitorSearchDni(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export function validateVisitorSearchDni(value: string): string | null {
  if (value.trim().length === 0) {
    return VISITOR_SEARCH_DNI_REQUIRED_ERROR;
  }

  if (!DNI_DIGIT_PATTERN.test(value)) {
    return VISITOR_SEARCH_DNI_LENGTH_ERROR;
  }

  return null;
}

export function buildVisitorSearchUrl(value: string): string | null {
  if (validateVisitorSearchDni(value)) {
    return null;
  }

  return `/api/visitors/search?dni=${encodeURIComponent(value)}`;
}
