import * as vscode from "vscode";

import { DEFAULT_BASE_URL, normalizeBaseUrl } from "../utils/baseUrl";

const CONFIGURATION_NAMESPACE = "frameplanner";

export class ConfigurationService {
  public getBaseUrl(): string {
    const configured = vscode.workspace
      .getConfiguration(CONFIGURATION_NAMESPACE)
      .get<string>("baseUrl", DEFAULT_BASE_URL);

    return normalizeBaseUrl(configured);
  }

  public getPreferExternalBrowser(): boolean {
    return vscode.workspace
      .getConfiguration(CONFIGURATION_NAMESPACE)
      .get<boolean>("preferExternalBrowser", false);
  }
}
