import { describe, expect, test } from "vitest";

import { buildWebviewHtml } from "../../panel/webviewHtml";

describe("buildWebviewHtml", () => {
  test("includes the expected CSP and iframe src", () => {
    const html = buildWebviewHtml({
      cspSource: "vscode-webview://test",
      scriptUri: "vscode-webview://test/media/main.js",
      state: {
        baseUrl: "https://frameplanner.manga-farm.online/",
        currentTargetLabel: "現在の対象 .ndjson",
        currentTargetPath: "frameplans/sample.ndjson",
        hasTarget: true,
        iframeSrc: "https://frameplanner.manga-farm.online/?__frameplanner_reload=1",
        manualImportHint: "hint",
        reloadToken: 1
      },
      styleUri: "vscode-webview://test/media/main.css"
    });

    expect(html).toContain("default-src &#39;none&#39;");
    expect(html).toContain("frame-src https://frameplanner.manga-farm.online");
    expect(html).toContain("frameplans/sample.ndjson");
    expect(html).toContain("https://frameplanner.manga-farm.online/?__frameplanner_reload=1");
  });
});
