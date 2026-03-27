# FramePlanner

VS Code / Cursor から `https://frameplanner.manga-farm.online/` を開き、`.ndjson` の手動 import/export を補助する拡張です。

## できること

- FramePlanner を `WebviewPanel` 内で開く
- `.ndjson` を「現在の対象ファイル」として記憶する
- FramePlanner からエクスポートした `.ndjson` をワークスペースへ取り込む
- 必要に応じて外部ブラウザへフォールバックする

## 制約

- 既存 Web アプリ本体は変更していません
- `iframe` 内の状態は読み書きしません
- `.ndjson` のライブ同期、custom editor、認証、共有 URL、クラウド保存は未対応です
- `.ndjson` の内容は opaque に扱います。構造検証や差分マージはしません

## コマンド

- `FramePlanner: Open Panel`
- `FramePlanner: Open Current NDJSON`
- `FramePlanner: Import Exported NDJSON`
- `FramePlanner: Open In Browser`

エクスプローラー上で `.ndjson` を右クリックすると、`Open Current NDJSON` と `Import Exported NDJSON` も使えます。

## 使い方

1. `FramePlanner: Open Panel` を実行して FramePlanner を開く
2. ワークスペース上の `.ndjson` に対して `FramePlanner: Open Current NDJSON` を実行する
3. FramePlanner 側で手動 import / 編集 / export を行う
4. 拡張側で `FramePlanner: Import Exported NDJSON` を実行し、エクスポート済みファイルを取り込む

現在の対象 `.ndjson` がある場合は、そのファイルへ上書き確認を出します。無い場合は `frameplans/` 配下への保存候補を提案します。

## 設定

- `frameplanner.baseUrl`
  - 既定値: `https://frameplanner.manga-farm.online/`
  - `https://` または `http://localhost` のみ許可します
- `frameplanner.preferExternalBrowser`
  - `true` にすると `Open Panel` 系コマンドは外部ブラウザを優先します

## 開発

```bash
pnpm install
pnpm build
pnpm test
pnpm test:integration
pnpm package
```

## VSIX の導入

### VS Code

1. `pnpm package` で `.vsix` を生成する
2. コマンドパレットで `Extensions: Install from VSIX...` を実行する
3. 生成された `.vsix` を選択する

### Cursor

1. `pnpm package` で `.vsix` を生成する
2. Cursor の Extensions 画面またはコマンドパレットから `Install from VSIX...` を実行する
3. 生成された `.vsix` を選択する

## Marketplace 公開前に差し替える項目

- `package.json` の `publisher`
- `repository`, `bugs`, `homepage`
- スクリーンショットや公開用説明文
