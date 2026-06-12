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
    const resolvedUserId = await resolveUserId(userId);
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("questions")
      .select("topic, block")
      .eq("is_active", true)
      .not("topic", "is", null);

    const topics = new Map<string, Map<string, number>>();

    for (const row of data ?? []) {
      const topic = String(row.topic ?? "").trim();
      const block = String(row.block ?? "").trim();

      if (!topic) {
        continue;
      }

      const titles = topics.get(topic) ?? new Map<string, number>();

      if (block) {
        titles.set(block, (titles.get(block) ?? 0) + 1);
      }

      topics.set(topic, titles);
    }

    return [...topics.entries()]
      .map(([topic, titles]) => ({
        topic,
        topicTitle:
          [...titles.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
          null,
      }))
      .sort((left, right) =>
        left.topic.localeCompare(right.topic, "es", { numeric: true }),
      );
  } catch {
    return [];
  }
}
