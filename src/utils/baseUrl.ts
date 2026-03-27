export const DEFAULT_BASE_URL = "https://frameplanner.manga-farm.online/";

export function normalizeBaseUrl(value: string): string {
  const url = validateBaseUrl(value);
  return url.toString();
}

export function validateBaseUrl(value: string): URL {
  const candidate = value.trim() || DEFAULT_BASE_URL;
  const url = new URL(candidate);

  if (url.protocol === "https:") {
    return url;
  }

  if (url.protocol === "http:" && url.hostname === "localhost") {
    return url;
  }

  throw new Error("frameplanner.baseUrl は https:// または http://localhost のみ指定できます。");
}

export function buildFramePlannerUrl(baseUrl: string, reloadToken: number): string {
  const url = validateBaseUrl(baseUrl);
  url.searchParams.set("__frameplanner_vscode", "1");
  url.searchParams.set("__frameplanner_reload", String(reloadToken));
  return url.toString();
}

export function getFrameSourceOrigin(baseUrl: string): string {
  return validateBaseUrl(baseUrl).origin;
}
