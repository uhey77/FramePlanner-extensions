import * as vscode from "vscode";

const CURRENT_TARGET_KEY = "frameplanner.currentNdjsonUri";

export class NdjsonTargetState {
  public constructor(private readonly state: vscode.Memento) {}

  public get(): vscode.Uri | undefined {
    const rawValue = this.state.get<string>(CURRENT_TARGET_KEY);
    if (!rawValue) {
      return undefined;
    }

    try {
      return vscode.Uri.parse(rawValue);
    } catch {
      return undefined;
    }
  }

  public async set(uri: vscode.Uri): Promise<void> {
    await this.state.update(CURRENT_TARGET_KEY, uri.toString());
  }

  public async clear(): Promise<void> {
    await this.state.update(CURRENT_TARGET_KEY, undefined);
  }
}
