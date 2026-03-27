(() => {
  const vscode = acquireVsCodeApi();
  const root = document.getElementById("app");

  if (!root) {
    return;
  }

  const elements = {
    iframe: document.getElementById("frameplanner-frame"),
    currentTargetLabel: document.getElementById("current-target-label"),
    currentTargetPath: document.getElementById("current-target-path"),
    manualImportHint: document.getElementById("manual-import-hint"),
    baseUrl: document.getElementById("base-url"),
    showCurrentButton: document.getElementById("show-current-ndjson")
  };

  let currentIframeSrc = "";
  let state = JSON.parse(root.dataset.state ?? "{}");

  const render = (nextState) => {
    state = nextState;

    if (elements.iframe instanceof HTMLIFrameElement && currentIframeSrc !== nextState.iframeSrc) {
      currentIframeSrc = nextState.iframeSrc;
      elements.iframe.src = nextState.iframeSrc;
    }

    if (elements.currentTargetLabel) {
      elements.currentTargetLabel.textContent = nextState.currentTargetLabel;
    }

    if (elements.currentTargetPath) {
      elements.currentTargetPath.textContent = nextState.currentTargetPath;
    }

    if (elements.manualImportHint) {
      elements.manualImportHint.textContent = nextState.manualImportHint;
    }

    if (elements.baseUrl) {
      elements.baseUrl.textContent = nextState.baseUrl;
    }

    if (elements.showCurrentButton instanceof HTMLButtonElement) {
      elements.showCurrentButton.disabled = !nextState.hasTarget;
    }
  };

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.getAttribute("data-command");
      if (!type) {
        return;
      }

      vscode.postMessage({ type });
    });
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (message?.type === "state") {
      render(message.payload);
    }
  });

  render(state);
})();
