"use server";

import { cookies } from "next/headers";
import {
  actionOk,
  toActionError,
  type ActionResult,
} from "@/lib/actionResult";
import { ADMIN_COOKIE_NAME, assertAdminAccess } from "@/lib/admin/gate";
import {
  loadStoredQualityIssues,
  markQualityIssueReviewed,
  runQuestionQualityAudit,
  setQuestionActive,
  type QualityAuditResult,
  type QualityFlagType,
  type QualityIssue,
} from "@/lib/quality";

async function getAdminToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value;
}

export async function auditQuestionBankAction(): Promise<
  ActionResult<QualityAuditResult>
> {
  try {
    assertAdminAccess(await getAdminToken());
    const data = await runQuestionQualityAudit();
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function loadQualityIssuesAction(input?: {
  flagType?: QualityFlagType;
  reviewed?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<{ issues: QualityIssue[]; total: number }>> {
  try {
    assertAdminAccess(await getAdminToken());
    const pageSize = input?.pageSize ?? 50;
    const page = input?.page ?? 1;
    const data = await loadStoredQualityIssues({
      flagType: input?.flagType,
      reviewed: input?.reviewed,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
    return actionOk(data);
  } catch (error) {
    return toActionError(error);
  }
}

export async function reviewQualityIssueAction(
  questionId: string,
  flagType: QualityFlagType,
  reviewed: boolean,
): Promise<ActionResult<void>> {
  try {
    assertAdminAccess(await getAdminToken());
    await markQualityIssueReviewed(questionId, flagType, reviewed);
    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}

export async function setQuestionActiveAction(
  questionId: string,
  isActive: boolean,
): Promise<ActionResult<void>> {
  try {
    assertAdminAccess(await getAdminToken());
    await setQuestionActive(questionId, isActive);
    return actionOk(undefined);
  } catch (error) {
    return toActionError(error);
  }
}
