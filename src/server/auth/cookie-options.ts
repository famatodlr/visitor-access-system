interface CookieSecurityEnvironment {
  nodeEnv?: string;
  sessionCookieSecure?: string;
}

export function shouldUseSecureGuardSessionCookie({
  nodeEnv,
  sessionCookieSecure,
}: CookieSecurityEnvironment): boolean {
  if (sessionCookieSecure === "false") {
    return false;
  }

  return nodeEnv === "production";
}
