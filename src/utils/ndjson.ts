import * as path from "path";

interface SuggestedImportPathInput {
  readonly sourceDirectory: string;
  readonly sourceFileName: string;
  readonly workspaceRoot?: string;
}

export function isNdjsonPath(filePath: string): boolean {
  return filePath.toLowerCase().endsWith(".ndjson");
}

export function ensureNdjsonFileName(fileName: string): string {
  return isNdjsonPath(fileName) ? fileName : `${fileName}.ndjson`;
}

export function getSuggestedImportTargetFsPath(input: SuggestedImportPathInput): string {
  const baseDirectory = input.workspaceRoot
    ? path.join(input.workspaceRoot, "frameplans")
    : input.sourceDirectory;

  return path.join(baseDirectory, ensureNdjsonFileName(path.basename(input.sourceFileName)));
}
