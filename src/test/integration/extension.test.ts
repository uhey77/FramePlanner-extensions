import * as assert from "assert";
import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

import * as vscode from "vscode";

const FRAMEPLANNER_PANEL_VIEWTYPE = "frameplanner.panel";

suite("FramePlanner extension", () => {
  teardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");
    await vscode.workspace
      .getConfiguration("frameplanner")
      .update("preferExternalBrowser", false, vscode.ConfigurationTarget.Global);
  });

  test("registers all public commands", async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(commands.includes("frameplanner.openPanel"));
    assert.ok(commands.includes("frameplanner.openCurrentNdjson"));
    assert.ok(commands.includes("frameplanner.importExportedNdjson"));
    assert.ok(commands.includes("frameplanner.openInBrowser"));
  });

  test("reuses a single webview panel", async () => {
    await vscode.workspace
      .getConfiguration("frameplanner")
      .update("preferExternalBrowser", false, vscode.ConfigurationTarget.Global);

    await vscode.commands.executeCommand("frameplanner.openPanel");
    await waitFor(() => countFramePlannerPanels() === 1);

    await vscode.commands.executeCommand("frameplanner.openPanel");
    await waitFor(() => countFramePlannerPanels() === 1);

    assert.strictEqual(countFramePlannerPanels(), 1);
  });

  test("rejects non-ndjson files when opening current target", async () => {
    const tempFilePath = path.join(os.tmpdir(), `frameplanner-${Date.now()}.txt`);
    await fs.writeFile(tempFilePath, "plain text");

    await vscode.commands.executeCommand("frameplanner.openCurrentNdjson", vscode.Uri.file(tempFilePath));
    await sleep(400);

    assert.strictEqual(countFramePlannerPanels(), 0);
  });
});

async function waitFor(predicate: () => boolean, timeoutMs = 5000): Promise<void> {
  const startedAt = Date.now();

  while (!predicate()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Timed out while waiting for expected VS Code state.");
    }

    await sleep(100);
  }
}

function countFramePlannerPanels(): number {
  return vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .filter((tab) => tab.input instanceof vscode.TabInputWebview && tab.input.viewType === FRAMEPLANNER_PANEL_VIEWTYPE)
    .length;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
