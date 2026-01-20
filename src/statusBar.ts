import * as vscode from "vscode";
import * as os from "os";

export enum SetupStatus {
  NotStarted = "not-started",
  InProgress = "in-progress",
  Complete = "complete",
  Error = "error",
}

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private currentStatus: SetupStatus = SetupStatus.NotStarted;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.statusBarItem.command = "bartdorsey.showMenu";
    this.updateStatusBar();
    this.statusBarItem.show();
  }

  public setStatus(status: SetupStatus): void {
    this.currentStatus = status;
    this.updateStatusBar();
  }

  private getEnvironmentLabel(): string {
    const remoteName = vscode.env.remoteName;

    if (remoteName === "wsl") {
      return " [WSL]";
    }

    const platform = os.platform();
    if (platform === "win32") {
      return " [Windows]";
    } else if (
      platform === "linux" &&
      os.release().toLowerCase().includes("microsoft")
    ) {
      return " [WSL]";
    } else if (platform === "linux") {
      return " [Linux]";
    }

    return "";
  }

  private updateStatusBar(): void {
    const envLabel = this.getEnvironmentLabel();

    switch (this.currentStatus) {
      case SetupStatus.NotStarted:
        this.statusBarItem.text = "$(rocket)";
        this.statusBarItem.tooltip = `${envLabel}: Click to configure settings`;
        this.statusBarItem.backgroundColor = undefined;
        break;
      case SetupStatus.InProgress:
        this.statusBarItem.text = "$(sync~spin)";
        this.statusBarItem.tooltip = `${envLabel}: Setup in progress...`;
        this.statusBarItem.backgroundColor = undefined;
        break;
      case SetupStatus.Complete:
        this.statusBarItem.text = "$(check)";
        this.statusBarItem.tooltip = `${envLabel}: Setup complete`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          "statusBarItem.prominentBackground",
        );
        break;
      case SetupStatus.Error:
        this.statusBarItem.text = "$(warning)";
        this.statusBarItem.tooltip = `${envLabel}: Setup completed with errors. Click to retry.`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor(
          "statusBarItem.errorBackground",
        );
        break;
    }
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
