import * as vscode from "vscode";
import * as os from "os";

/**
 * Enum representing the current state of the extension setup process.
 * Used to track and display the progress of environment configuration.
 */
export enum SetupStatus {
  /** Setup has not been started yet */
  NotStarted = "not-started",
  /** Setup is currently in progress */
  InProgress = "in-progress",
  /** Setup has completed successfully */
  Complete = "complete",
  /** Setup encountered errors during execution */
  Error = "error",
}

export class StatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private currentStatus: SetupStatus = SetupStatus.NotStarted;

  /**
   * Creates a new status bar item that displays the current setup status
   * and provides a clickable interface to open the main menu.
   */
  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.statusBarItem.command = "bartdorsey.showMenu";
    this.updateStatusBar();
    this.statusBarItem.show();
  }

  /**
   * Updates the current setup status and refreshes the status bar display.
   *
   * @param status The new setup status to display
   */
  public setStatus(status: SetupStatus): void {
    this.currentStatus = status;
    this.updateStatusBar();
  }

  /**
   * Generates an environment label for display in the status bar tooltip.
   * Detects Windows, WSL, and Linux environments.
   *
   * @returns A formatted environment label string (e.g., " [WSL]", " [Windows]")
   *          or empty string for unrecognized environments
   */
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

  /**
   * Updates the status bar item's visual appearance based on the current setup status.
   * Sets appropriate icons, tooltips, and background colors for each status state.
   */
  private updateStatusBar(): void {
    const envLabel = this.getEnvironmentLabel();

    switch (this.currentStatus) {
      case SetupStatus.NotStarted:
        this.statusBarItem.text = "$(gear)";
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

  /**
   * Disposes of the status bar item and cleans up resources.
   * Called automatically when the extension is deactivated.
   */
  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
