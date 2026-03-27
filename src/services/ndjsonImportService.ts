import * as path from "path";
import * as vscode from "vscode";

import { NdjsonTargetState } from "../state/ndjsonTargetState";
import { ensureNdjsonFileName, isNdjsonPath } from "../utils/ndjson";
import { ensureNdjsonUri, formatUriForDisplay, getDirectoryUri } from "../utils/vscodeUri";

export interface NdjsonImportResult {
  readonly sourceUri: vscode.Uri;
  readonly targetUri: vscode.Uri;
}

export class NdjsonImportService {
  public constructor(private readonly targetState: NdjsonTargetState) {}

  public async importNdjson(resourceUri?: vscode.Uri): Promise<NdjsonImportResult | undefined> {
    const sourceUri = resourceUri
      ? this.validateNdjsonUri(resourceUri)
      : await this.pickSourceUri();

    if (!sourceUri) {
      return undefined;
    }

    const targetUri = await this.resolveTargetUri(sourceUri);
    if (!targetUri) {
      return undefined;
    }

    const normalizedTargetUri = ensureNdjsonUri(targetUri);
    const fileContent = await vscode.workspace.fs.readFile(sourceUri);

    await vscode.workspace.fs.createDirectory(getDirectoryUri(normalizedTargetUri));
    await vscode.workspace.fs.writeFile(normalizedTargetUri, fileContent);
    await this.targetState.set(normalizedTargetUri);

    const document = await vscode.workspace.openTextDocument(normalizedTargetUri);
    await vscode.window.showTextDocument(document, { preserveFocus: true, preview: false });

    void vscode.window.showInformationMessage(
      `NDJSON を取り込みました: ${formatUriForDisplay(normalizedTargetUri)}`
    );

    return {
      sourceUri,
      targetUri: normalizedTargetUri
    };
  }

  private validateNdjsonUri(uri: vscode.Uri): vscode.Uri | undefined {
    if (isNdjsonPath(uri.path)) {
      return uri;
    }

    void vscode.window.showErrorMessage(".ndjson ファイルを選択してください。");
    return undefined;
  }

  private async pickSourceUri(): Promise<vscode.Uri | undefined> {
    const selectedUris = await vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      filters: {
        NDJSON: ["ndjson"]
      },
      openLabel: "エクスポート済み .ndjson を選択"
    });

    if (!selectedUris || selectedUris.length === 0) {
      return undefined;
    }

    return this.validateNdjsonUri(selectedUris[0]);
  }

  private async resolveTargetUri(sourceUri: vscode.Uri): Promise<vscode.Uri | undefined> {
    const currentTargetUri = this.targetState.get();
    if (currentTargetUri) {
      const action = await vscode.window.showWarningMessage(
        `現在の対象ファイル ${formatUriForDisplay(currentTargetUri)} を上書きしますか？`,
        { modal: true },
        "上書きする"
      );

      if (action !== "上書きする") {
        return undefined;
      }

      return currentTargetUri;
    }

    const defaultTargetUri = this.createDefaultTargetUri(sourceUri);
    const targetUri = await vscode.window.showSaveDialog({
      defaultUri: defaultTargetUri,
      filters: {
        NDJSON: ["ndjson"]
      },
      saveLabel: "取り込み先として保存"
    });

    if (!targetUri) {
      return undefined;
    }

    return ensureNdjsonUri(targetUri);
  }

  private createDefaultTargetUri(sourceUri: vscode.Uri): vscode.Uri {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(sourceUri) ?? vscode.workspace.workspaceFolders?.[0];
    const fileName = ensureNdjsonFileName(path.posix.basename(sourceUri.path));

    if (workspaceFolder) {
      return vscode.Uri.joinPath(workspaceFolder.uri, "frameplans", fileName);
    }

    return sourceUri.with({
      path: path.posix.join(path.posix.dirname(sourceUri.path), fileName)
    });
  }
}
