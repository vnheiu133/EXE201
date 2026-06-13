export const DEFAULT_SERVICE_IMAGE = "/placeholder.jpg";

function parseJsonImage(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function normalizeImageUrl(value: unknown, fallback = DEFAULT_SERVICE_IMAGE): string {
  if (Array.isArray(value)) {
    const firstValid = value.find((item) => typeof item === "string" && item.trim() !== "");
    return normalizeImageUrl(firstValid, fallback);
  }

  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
    return fallback;
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    const parsed = parseJsonImage(trimmed);
    if (parsed) return normalizeImageUrl(parsed, fallback);
  }

  const normalized = trimmed.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("/")) {
    return normalized;
  }

  return `/${normalized.replace(/^\/+/, "")}`;
}
