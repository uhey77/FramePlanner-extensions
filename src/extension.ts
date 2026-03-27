import * as vscode from "vscode";

import { registerCommands } from "./commands/registerCommands";
import { FramePlannerPanelManager } from "./panel/framePlannerPanel";
import { ConfigurationService } from "./services/configurationService";
import { NdjsonImportService } from "./services/ndjsonImportService";
import { NdjsonTargetState } from "./state/ndjsonTargetState";

export function activate(context: vscode.ExtensionContext): void {
  const configurationService = new ConfigurationService();
  const targetState = new NdjsonTargetState(context.workspaceState);
  const importService = new NdjsonImportService(targetState);
  const panelManager = new FramePlannerPanelManager(context, configurationService, targetState, importService);

  context.subscriptions.push(panelManager);

  registerCommands(context, {
    configurationService,
    importService,
    panelManager,
    targetState
  });

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async (event) => {
      if (!event.affectsConfiguration("frameplanner")) {
        return;
      }

      try {
        await panelManager.handleConfigurationChange();
      } catch (error) {
        void vscode.window.showErrorMessage(getErrorMessage(error));
      }
    })
  );
}

export function deactivate(): void {
  // VS Code disposes subscriptions automatically.
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "FramePlanner 拡張で不明なエラーが発生しました。";
}
