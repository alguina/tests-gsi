"use server";

import { cookies } from "next/headers";
import {
  actionOk,
  toActionError,
  type ActionResult,
} from "@/lib/actionResult";
import { DEFAULT_USER_ID } from "@/lib/currentUser";
import { buildMarkdownExport } from "@/lib/exports/buildExport";
import type { ExportDocument, ExportType } from "@/lib/exports/types";
import { PROFILE_COOKIE_NAME } from "@/lib/profile/profileStore";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TEMARIO_OFICIAL } from "@/lib/officialTopics";

async function resolveUserId(clientUserId?: string): Promise<string> {
  if (clientUserId) {
    return clientUserId;
  }

  const cookieStore = await cookies();
  return cookieStore.get(PROFILE_COOKIE_NAME)?.value ?? DEFAULT_USER_ID;
}

async function resolveProfileName(userId: string): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();

  return data?.name ?? null;
}

export async function generateMarkdownExportAction(input: {
  type: ExportType;
  userId?: string;
  from?: string;
  to?: string;
  topic?: string;
  studyGoal?: string;
}): Promise<ActionResult<ExportDocument>> {
  try {
    const userId = await resolveUserId(input.userId);
    const profileName = await resolveProfileName(userId);
    const data = await buildMarkdownExport({
      type: input.type,
      userId,
      profileName,
      topic: input.topic ?? null,
      studyGoal: input.studyGoal ?? null,
      dateRange:
        input.from && input.to
          ? { from: input.from, to: input.to }
          : undefined,
    });

    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function listExportTopicsAction(
  userId?: string,
): Promise<Array<{ topic: string; topicTitle: string | null }>> {
  try {
    await resolveUserId(userId);
    return TEMARIO_OFICIAL.map((item) => ({
      topic: `${item.bloque}.${item.tema}`,
      topicTitle: item.titulo,
    }));
  } catch {
    return [];
  }
}
