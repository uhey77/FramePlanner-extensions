import * as vscode from "vscode";

import { FramePlannerPanelManager } from "../panel/framePlannerPanel";
import { ConfigurationService } from "../services/configurationService";
import { NdjsonImportService } from "../services/ndjsonImportService";
import { NdjsonTargetState } from "../state/ndjsonTargetState";
import { isNdjsonUri } from "../utils/vscodeUri";

interface CommandDependencies {
  readonly configurationService: ConfigurationService;
  readonly importService: NdjsonImportService;
  readonly panelManager: FramePlannerPanelManager;
  readonly targetState: NdjsonTargetState;
}

export function registerCommands(
  context: vscode.ExtensionContext,
  dependencies: CommandDependencies
): void {
  const register = (command: string, callback: (...args: any[]) => Promise<void>) => {
    context.subscriptions.push(
      vscode.commands.registerCommand(command, (...args: any[]) => {
        void runGuarded(() => callback(...args));
      })
    );
  };

  register("frameplanner.openPanel", async () => {
    if (dependencies.configurationService.getPreferExternalBrowser()) {
      await dependencies.panelManager.openInBrowser();
      return;
    }

    await dependencies.panelManager.show();
  });

  register("frameplanner.openCurrentNdjson", async (resource?: vscode.Uri) => {
    const candidateUri = getCandidateUri(resource);

    if (!candidateUri || !isNdjsonUri(candidateUri)) {
      void vscode.window.showErrorMessage(".ndjson ファイルを選択してください。");
      return;
    }

    await dependencies.targetState.set(candidateUri);

    if (dependencies.configurationService.getPreferExternalBrowser()) {
      await dependencies.panelManager.openInBrowser();
      return;
    }

    await dependencies.panelManager.show();
    await dependencies.panelManager.refresh();
  });

  register("frameplanner.importExportedNdjson", async (resource?: vscode.Uri) => {
    const result = await dependencies.importService.importNdjson(resource);
    if (!result) {
      return;
    }

    if (dependencies.configurationService.getPreferExternalBrowser()) {
      return;
    }

    await dependencies.panelManager.show();
    await dependencies.panelManager.refresh();
  });

  register("frameplanner.openInBrowser", async () => {
    await dependencies.panelManager.openInBrowser();
  });
}

function getCandidateUri(resource?: vscode.Uri): vscode.Uri | undefined {
  if (resource) {
    return resource;
  }

  return vscode.window.activeTextEditor?.document.uri;
}

async function runGuarded(
  callback: () => Promise<void>
): Promise<void> {
  try {
    await callback();
  } catch (error) {
    void vscode.window.showErrorMessage(getErrorMessage(error));
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "FramePlanner コマンドの実行に失敗しました。";
}
