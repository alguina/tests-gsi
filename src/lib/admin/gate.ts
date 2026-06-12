export const ADMIN_COOKIE_NAME = "gsi_admin_token";

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_ACCESS_TOKEN?.trim());
}

export function isAdminTokenValid(token: string | undefined | null): boolean {
  const expected = process.env.ADMIN_ACCESS_TOKEN?.trim();

  if (!expected || !token) {
    return false;
  }

  return token === expected;
}

export function assertAdminAccess(token: string | undefined | null): void {
  if (!isAdminConfigured()) {
    return;
  }

  if (!isAdminTokenValid(token)) {
    throw new Error("ADMIN_ACCESS_DENIED");
  }
}

export const ADMIN_ROUTE_PREFIXES = [
  "/import",
  "/discover",
  "/saved",
  "/admin",
] as const;

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
