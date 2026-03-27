import * as path from "path";

import { describe, expect, test } from "vitest";

import { ensureNdjsonFileName, getSuggestedImportTargetFsPath, isNdjsonPath } from "../../utils/ndjson";

describe("ndjson utilities", () => {
  test("detects ndjson file names", () => {
    expect(isNdjsonPath("/tmp/sample.ndjson")).toBe(true);
    expect(isNdjsonPath("/tmp/sample.json")).toBe(false);
  });

  test("ensures the ndjson extension", () => {
    expect(ensureNdjsonFileName("sample")).toBe("sample.ndjson");
    expect(ensureNdjsonFileName("sample.ndjson")).toBe("sample.ndjson");
  });

  test("resolves the suggested import destination", () => {
    expect(
      getSuggestedImportTargetFsPath({
        sourceDirectory: "/tmp/exports",
        sourceFileName: "scene.ndjson",
        workspaceRoot: "/workspace/project"
      })
    ).toBe(path.join("/workspace/project", "frameplans", "scene.ndjson"));
  });
});
