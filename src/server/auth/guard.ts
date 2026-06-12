import { readGuardSessionCookie } from "./cookies";
import {
  AuthConfigurationError,
  createGuardSessionToken,
  type GuardSession,
  verifyGuardSessionToken,
} from "./session";

export type AuthResult =
  | { ok: true; token: string }
  | {
      ok: false;
      status: 400 | 401 | 500;
      error: "PIN is required." | "Invalid PIN." | "Authentication is not configured.";
    };

export class GuardSessionRequiredError extends Error {
  constructor(message = "Guard authentication is required.") {
    super(message);
    this.name = "GuardSessionRequiredError";
  }
}

function getGuardPin(): string {
  const guardPin = process.env.GUARD_PIN?.trim();

  if (!guardPin) {
    throw new AuthConfigurationError();
  }

  return guardPin;
}

export function authenticateGuard(pin: unknown): AuthResult {
  if (typeof pin !== "string" || pin.trim().length === 0) {
    return {
      ok: false,
      status: 400,
      error: "PIN is required.",
    };
  }

  let expectedPin: string;

  try {
    expectedPin = getGuardPin();
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return {
        ok: false,
        status: 500,
        error: "Authentication is not configured.",
      };
    }

    throw error;
  }

  if (pin !== expectedPin) {
    return {
      ok: false,
      status: 401,
      error: "Invalid PIN.",
    };
  }

  try {
    return {
      ok: true,
      token: createGuardSessionToken(),
    };
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return {
        ok: false,
        status: 500,
        error: "Authentication is not configured.",
      };
    }

    throw error;
  }
}

export async function getGuardSession(): Promise<GuardSession | null> {
  const token = await readGuardSessionCookie();

  if (!token) {
    return null;
  }

  return verifyGuardSessionToken(token);
}

export async function requireGuardSession(): Promise<GuardSession> {
  const session = await getGuardSession();

  if (!session) {
    throw new GuardSessionRequiredError();
  }

  return session;
}
