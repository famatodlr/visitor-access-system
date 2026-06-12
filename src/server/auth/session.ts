import { createHmac, timingSafeEqual } from "crypto";

export const GUARD_SESSION_DURATION_SECONDS = 60 * 60 * 8;

export interface GuardSession {
  role: "guard";
  expiresAt: number;
}

export class AuthConfigurationError extends Error {
  constructor(message = "Authentication is not configured.") {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();

  if (!secret) {
    throw new AuthConfigurationError();
  }

  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function parseSessionPayload(payload: string): GuardSession | null {
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      role?: unknown;
      expiresAt?: unknown;
    };

    if (decoded.role !== "guard" || typeof decoded.expiresAt !== "number") {
      return null;
    }

    if (!Number.isFinite(decoded.expiresAt) || decoded.expiresAt <= Date.now()) {
      return null;
    }

    return {
      role: "guard",
      expiresAt: decoded.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createGuardSessionToken(): string {
  const session: GuardSession = {
    role: "guard",
    expiresAt: Date.now() + GUARD_SESSION_DURATION_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyGuardSessionToken(token: string): GuardSession | null {
  const [payload, signature, extra] = token.split(".");

  if (!payload || !signature || extra !== undefined) {
    return null;
  }

  try {
    if (!signaturesMatch(sign(payload), signature)) {
      return null;
    }
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return null;
    }

    throw error;
  }

  return parseSessionPayload(payload);
}
