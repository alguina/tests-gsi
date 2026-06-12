type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, string | number | boolean | null | undefined>;

const REDACTED_KEYS = ["note", "answer", "text", "token", "secret", "key"];

function sanitizePayload(payload: LogPayload): LogPayload {
  const sanitized: LogPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (REDACTED_KEYS.some((part) => key.toLowerCase().includes(part))) {
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

export function logServerEvent(
  event: string,
  payload: LogPayload = {},
  level: LogLevel = "info",
): void {
  const entry = {
    ts: new Date().toISOString(),
    event,
    level,
    ...sanitizePayload(payload),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}
