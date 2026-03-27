import * as vscode from "vscode";

import { buildFramePlannerUrl } from "../utils/baseUrl";
import { formatUriForDisplay } from "../utils/vscodeUri";
import { buildWebviewHtml, type FramePlannerPanelState } from "./webviewHtml";
import { ConfigurationService } from "../services/configurationService";
import { NdjsonImportService } from "../services/ndjsonImportService";
import { NdjsonTargetState } from "../state/ndjsonTargetState";

const MEDIA_ROOT = "media";

export const FRAMEPLANNER_PANEL_VIEWTYPE = "frameplanner.panel";

type WebviewCommand = "openExternal" | "showCurrentNdjson" | "importNdjson" | "reload";

interface WebviewMessage {
  readonly type: WebviewCommand;
}

export class FramePlannerPanelManager implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly mediaRoot: vscode.Uri;
  private reloadToken = Date.now();

  public constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly configurationService: ConfigurationService,
    private readonly targetState: NdjsonTargetState,
    private readonly importService: NdjsonImportService
  ) {
    this.mediaRoot = vscode.Uri.joinPath(this.context.extensionUri, MEDIA_ROOT);
  }

  public async show(): Promise<void> {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Active);
      await this.refresh();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      FRAMEPLANNER_PANEL_VIEWTYPE,
      "FramePlanner",
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [this.mediaRoot],
        retainContextWhenHidden: true
      }
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    }, null, this.disposables);

    this.panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
      void this.handleMessage(message);
    }, null, this.disposables);

    this.panel.webview.html = this.renderHtml();
  }

  public async refresh(): Promise<void> {
    if (!this.panel) {
      return;
    }

    await this.panel.webview.postMessage({
      payload: this.createState(),
      type: "state"
    });
  }

  public async handleConfigurationChange(): Promise<void> {
    if (!this.panel) {
      return;
    }

    this.panel.webview.html = this.renderHtml();
  }

  public async openInBrowser(): Promise<void> {
    const uri = vscode.Uri.parse(this.configurationService.getBaseUrl());
    await vscode.env.openExternal(uri);
  }

  public dispose(): void {
    this.panel?.dispose();
    vscode.Disposable.from(...this.disposables).dispose();
  }

  private renderHtml(): string {
    if (!this.panel) {
      throw new Error("FramePlanner パネルが初期化されていません。");
    }

    const webview = this.panel.webview;
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.mediaRoot, "main.js")).toString();
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.mediaRoot, "main.css")).toString();

    return buildWebviewHtml({
      cspSource: webview.cspSource,
      scriptUri,
      state: this.createState(),
      styleUri
    });
  }

  private createState(): FramePlannerPanelState {
    const baseUrl = this.configurationService.getBaseUrl();
    const targetUri = this.targetState.get();
    const targetPath = targetUri ? formatUriForDisplay(targetUri) : "未設定";

    return {
      baseUrl,
      currentTargetLabel: targetUri ? "現在の対象 .ndjson" : "対象 .ndjson 未設定",
      currentTargetPath: targetUri
        ? targetPath
        : "エクスプローラーまたはアクティブエディタから .ndjson を選択してください。",
      hasTarget: Boolean(targetUri),
      iframeSrc: buildFramePlannerUrl(baseUrl, this.reloadToken),
      manualImportHint: targetUri
        ? "FramePlanner から .ndjson をエクスポートした後、このパネルの「エクスポート済み .ndjson を取り込む」を使ってください。"
        : "先に .ndjson を対象ファイルとして開くと、次の取り込み先に使われます。",
      reloadToken: this.reloadToken
    };
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    try {
      switch (message.type) {
        case "openExternal":
          await this.openInBrowser();
          return;
        case "showCurrentNdjson":
          await this.showCurrentNdjson();
          return;
        case "importNdjson":
          await this.importService.importNdjson();
          await this.refresh();
          return;
        case "reload":
          this.reloadToken = Date.now();
          await this.refresh();
          return;
        default:
          return;
      }
    } catch (error) {
      void vscode.window.showErrorMessage(getErrorMessage(error));
    }
  }

  private async showCurrentNdjson(): Promise<void> {
    const targetUri = this.targetState.get();
    if (!targetUri) {
      void vscode.window.showInformationMessage("現在の対象 .ndjson はまだ設定されていません。");
      return;
    }

    const document = await vscode.workspace.openTextDocument(targetUri);
    await vscode.window.showTextDocument(document, { preview: false });
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "FramePlanner パネルの操作に失敗しました。";
}
