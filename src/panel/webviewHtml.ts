import { getFrameSourceOrigin } from "../utils/baseUrl";
import { escapeHtml } from "../utils/html";

export interface FramePlannerPanelState {
  readonly baseUrl: string;
  readonly currentTargetLabel: string;
  readonly currentTargetPath: string;
  readonly hasTarget: boolean;
  readonly iframeSrc: string;
  readonly manualImportHint: string;
  readonly reloadToken: number;
}

interface BuildWebviewHtmlOptions {
  readonly cspSource: string;
  readonly scriptUri: string;
  readonly state: FramePlannerPanelState;
  readonly styleUri: string;
}

export function buildWebviewHtml(options: BuildWebviewHtmlOptions): string {
  const csp = [
    "default-src 'none'",
    `style-src ${options.cspSource}`,
    `script-src ${options.cspSource}`,
    `frame-src ${getFrameSourceOrigin(options.state.baseUrl)}`
  ].join("; ");

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="${escapeHtml(csp)}" />
    <title>FramePlanner</title>
    <link rel="stylesheet" href="${escapeHtml(options.styleUri)}" />
  </head>
  <body>
    <div
      id="app"
      class="shell"
      data-state="${escapeHtml(JSON.stringify(options.state))}"
    >
      <section class="toolbar">
        <div class="toolbar-top">
          <div class="brand">
            <div class="brand-title">FramePlanner</div>
            <div class="brand-subtitle">既存 Web アプリを VS Code / Cursor 内で扱います</div>
          </div>
          <div class="actions">
            <button class="action" data-command="openExternal" type="button">外部ブラウザで開く</button>
            <button class="action" data-command="showCurrentNdjson" id="show-current-ndjson" type="button">現在の .ndjson を表示</button>
            <button class="action" data-command="importNdjson" type="button">エクスポート済み .ndjson を取り込む</button>
            <button class="action" data-command="reload" type="button">再読み込み</button>
          </div>
        </div>

        <div class="status-grid">
          <article class="card">
            <p class="card-label" id="current-target-label">${escapeHtml(options.state.currentTargetLabel)}</p>
            <p class="card-value" id="current-target-path">${escapeHtml(options.state.currentTargetPath)}</p>
          </article>
          <article class="card">
            <p class="card-label">取り込み方法</p>
            <p class="card-value" id="manual-import-hint">${escapeHtml(options.state.manualImportHint)}</p>
          </article>
          <article class="card">
            <p class="card-label">接続先</p>
            <p class="card-value" id="base-url">${escapeHtml(options.state.baseUrl)}</p>
          </article>
        </div>
      </section>

      <section class="stage">
        <iframe
          id="frameplanner-frame"
          class="frame"
          src="${escapeHtml(options.state.iframeSrc)}"
          sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          referrerpolicy="strict-origin-when-cross-origin"
          title="FramePlanner"
        ></iframe>
      </section>
    </div>

    <script src="${escapeHtml(options.scriptUri)}"></script>
  </body>
</html>`;
}
