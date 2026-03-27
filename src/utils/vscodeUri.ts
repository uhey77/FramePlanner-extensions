import * as path from "path";
import * as vscode from "vscode";

import { isNdjsonPath } from "./ndjson";

export function isNdjsonUri(uri: vscode.Uri): boolean {
  return isNdjsonPath(uri.path);
}

export function ensureNdjsonUri(uri: vscode.Uri): vscode.Uri {
  if (isNdjsonUri(uri)) {
    return uri;
  }

  return uri.with({
    path: `${uri.path}.ndjson`
  });
}

export function getDirectoryUri(uri: vscode.Uri): vscode.Uri {
  return uri.with({
    path: path.posix.dirname(uri.path)
  });
}

export function formatUriForDisplay(uri: vscode.Uri): string {
  const relativePath = vscode.workspace.asRelativePath(uri, false);
  if (relativePath) {
    return relativePath;
  }

  return uri.fsPath || uri.toString();
}
