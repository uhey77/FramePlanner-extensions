import { describe, expect, test } from "vitest";

import { buildFramePlannerUrl, getFrameSourceOrigin, normalizeBaseUrl, validateBaseUrl } from "../../utils/baseUrl";

describe("baseUrl utilities", () => {
  test("accepts https urls", () => {
    expect(normalizeBaseUrl("https://frameplanner.manga-farm.online")).toBe(
      "https://frameplanner.manga-farm.online/"
    );
    expect(validateBaseUrl("https://example.com/path")).toBeInstanceOf(URL);
  });

  test("accepts localhost over http", () => {
    expect(normalizeBaseUrl("http://localhost:5173")).toBe("http://localhost:5173/");
  });

  test("rejects non localhost http urls", () => {
    expect(() => validateBaseUrl("http://example.com")).toThrow(
      "frameplanner.baseUrl は https:// または http://localhost のみ指定できます。"
    );
  });

  test("builds iframe url with reload token", () => {
    expect(buildFramePlannerUrl("https://frameplanner.manga-farm.online/", 123)).toContain(
      "__frameplanner_reload=123"
    );
    expect(getFrameSourceOrigin("https://frameplanner.manga-farm.online/path")).toBe(
      "https://frameplanner.manga-farm.online"
    );
  });
});
