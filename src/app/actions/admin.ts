"use server";

import { cookies } from "next/headers";
import {
  actionOk,
  toActionError,
  type ActionResult,
} from "@/lib/actionResult";
import {
  ADMIN_COOKIE_NAME,
  assertAdminAccess,
  isAdminConfigured,
  isAdminTokenValid,
} from "@/lib/admin/gate";

export async function verifyAdminAccessAction(
  token: string,
): Promise<ActionResult<void>> {
  try {
    if (!isAdminConfigured()) {
      return actionOk(undefined);
    }

    if (!isAdminTokenValid(token)) {
      throw new Error("ADMIN_ACCESS_DENIED");
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token.trim(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function clearAdminAccessAction(): Promise<ActionResult<void>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function requireAdminFromCookie(): Promise<void> {
  const cookieStore = await cookies();
  assertAdminAccess(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function getAdminGateStatus(): Promise<{
  configured: boolean;
  authorized: boolean;
}> {
  const configured = isAdminConfigured();

  if (!configured) {
    return { configured: false, authorized: true };
  }

  const cookieStore = await cookies();
  return {
    configured: true,
    authorized: isAdminTokenValid(cookieStore.get(ADMIN_COOKIE_NAME)?.value),
  };
}
