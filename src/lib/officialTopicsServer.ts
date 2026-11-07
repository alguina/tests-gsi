import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeTemarioOficialData,
  type AttemptRow,
  type TemarioOficialData,
} from "@/lib/officialTopics";

/**
 * Sesiones de verificacion automatica del 2026-11-07: 3 tests de 10 preguntas
 * (9/10, 9/10, 8/10) ejecutados por una herramienta de QA para comprobar que
 * el avance por perfil funcionaba. Son exactamente estas 3 sesiones
 * (modo random, 10 preguntas, 0 en blanco, creadas 11:22-11:26 UTC).
 * Se EXCLUYEN de las estadisticas nuevas para no contaminar el nivel del
 * usuario; NO se borran del historial.
 */
const VERIFICATION_SESSION_IDS: readonly string[] = [
  "3e442b62-1db7-4b3d-9cdf-8fe439ac173c",
  "55da93a0-2591-4e0f-82f6-b6445fd62add",
  "13ab7146-3fd5-4b5b-9827-cf928d14a941",
];

export const VERIFICATION_ATTEMPT_COUNT = 30;

/**
 * Carga server-side de la practica del usuario y agregacion por tema oficial.
 * Mismo patron que getDashboardStudyMetrics: tabla attempts filtrada por user_id.
 */
export async function getTemarioOficialData(userId: string): Promise<TemarioOficialData> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attempts")
    .select("question_id, is_correct, is_blank")
    .eq("user_id", userId)
    .not("session_id", "in", `(${VERIFICATION_SESSION_IDS.join(",")})`);

  if (error) {
    throw new Error(`Failed to load attempts: ${error.message}`);
  }

  return computeTemarioOficialData((data ?? []) as AttemptRow[]);
}
