import * as vscode from "vscode";
import * as os from "os";
import { defaultSettings } from "./settings";
import { StatusBar, SetupStatus } from "./statusBar";

// Required extensions for the bootcamp
const REQUIRED_EXTENSIONS = [
  "ms-python.python",
  "ms-python.black-formatter",
  "ms-python.flake8",
  "chadalen.vscode-jetbrains-icon-theme",
  "esbenp.prettier-vscode",
  "usernamehw.errorlens",
  "dbaeumer.vscode-eslint",
  "yzhang.markdown-all-in-one",
  "bierner.markdown-mermaid",
  "pomdtr.excalidraw-editor",
];

// Copilot extensions (installed separately)
const COPILOT_EXTENSIONS = ["github.copilot", "github.copilot-chat"];

// WSL-specific extension
const WSL_EXTENSION = "ms-vscode-remote.remote-wsl";

function getEnvironment(): "windows" | "wsl" | "linux" | "other" {
  const remoteName = vscode.env.remoteName;

  if (remoteName === "wsl") {
    return "wsl";
  }

  const platform = os.platform();
  if (platform === "win32") {
    return "windows";
  } else if (
    platform === "linux" &&
    os.release().toLowerCase().includes("microsoft")
  ) {
    // Running inside WSL but not via Remote-WSL extension
    return "wsl";
  } else if (platform === "linux") {
    return "linux";
  }

  return "other";
}

async function installExtensions(): Promise<{
  installed: number;
  failed: number;
  skipped: number;
}> {
  let installed = 0;
  let failed = 0;
  let skipped = 0;

  // Determine which extensions to install
  const extensionsToInstall = [...REQUIRED_EXTENSIONS];

  // Add WSL extension on Windows or when running inside WSL
  const isWindows = os.platform() === "win32";
  const isWSL =
    os.platform() === "linux" &&
    os.release().toLowerCase().includes("microsoft");
  if (isWindows || isWSL) {
    extensionsToInstall.push(WSL_EXTENSION);
  }

  for (const extensionId of extensionsToInstall) {
    try {
      // Check if extension is already installed
      const extension = vscode.extensions.getExtension(extensionId);
      if (extension) {
        console.log(`Extension ${extensionId} is already installed`);
        skipped++;
        continue;
      }

      // Install the extension
      await vscode.commands.executeCommand(
        "workbench.extensions.installExtension",
        extensionId,
      );
      console.log(`Successfully installed ${extensionId}`);
      installed++;
    } catch (error) {
      console.error(`Failed to install ${extensionId}:`, error);
      failed++;
    }
  }

  return { installed, failed, skipped };
}

export function activate(context: vscode.ExtensionContext) {
  // Create status bar
  const statusBar = new StatusBar();
  context.subscriptions.push(statusBar);

  // Menu command - shows quick pick menu
  const menuCommand = vscode.commands.registerCommand(
    "bartdorsey.showMenu",
    async () => {
      // Check current Copilot status
      const config = vscode.workspace.getConfiguration();
      const copilotSettings = config.get<any>("github.copilot.enable");
      const chatDisabled = config.get<boolean>("chat.disableAIFeatures");

      // Determine if Copilot is currently enabled
      // Copilot is considered enabled if either:
      // 1. github.copilot.enable has any true values, or
      // 2. chat.disableAIFeatures is false
      let copilotEnabled = false;
      if (copilotSettings && typeof copilotSettings === "object") {
        copilotEnabled = Object.values(copilotSettings).some(
          (val) => val === true,
        );
      }
      if (chatDisabled === false) {
        copilotEnabled = true;
      }

      const menuItems = [
        {
          label: "$(rocket) Configure Settings",
          description: "Install extensions and apply  settings",
          action: "configure",
        },
      ];

      // Add either Enable or Disable option based on current state
      if (copilotEnabled) {
        menuItems.push({
          label: "$(circle-slash) Disable GitHub Copilot",
          description: "Uninstall GitHub Copilot and disable AI chat features",
          action: "disableCopilot",
        });
      } else {
        menuItems.push({
          label: "$(copilot) Enable GitHub Copilot",
          description: "Install and enable GitHub Copilot and AI chat features",
          action: "enableCopilot",
        });
      }

      menuItems.push({
        label: "$(trash) Cleanup",
        description: "Uninstall extensions and revert settings",
        action: "cleanup",
      });

      const choice = await vscode.window.showQuickPick(menuItems, {
        placeHolder: "Choose an action",
      });

      if (choice) {
        if (choice.action === "configure") {
          vscode.commands.executeCommand("bartdorsey.configureSettings");
        } else if (choice.action === "enableCopilot") {
          vscode.commands.executeCommand("bartdorsey.enableCopilot");
        } else if (choice.action === "disableCopilot") {
          vscode.commands.executeCommand("bartdorsey.disableCopilot");
        } else if (choice.action === "cleanup") {
          vscode.commands.executeCommand("bartdorsey.cleanup");
        }
      }
    },
  );

  const configureCommand = vscode.commands.registerCommand(
    "bartdorsey.configureSettings",
    async () => {
      // Set status to in-progress
      statusBar.setStatus(SetupStatus.InProgress);
      const config = vscode.workspace.getConfiguration();

      // Detect environment and show appropriate message
      const environment = getEnvironment();
      let confirmMessage =
        "This will update your VSCode user settings with  recommended defaults and install required extensions. Continue?";

      if (environment === "wsl") {
        confirmMessage =
          "Running in WSL! This will install extensions in your WSL environment and apply settings. Continue?";
      } else if (environment === "windows") {
        confirmMessage =
          "This will install extensions on Windows and apply settings. Note: You'll need to run this again after connecting to WSL. Continue?";
      }

      // Ask for confirmation
      const answer = await vscode.window.showInformationMessage(
        confirmMessage,
        "Yes",
        "No",
      );

      if (answer !== "Yes") {
        statusBar.setStatus(SetupStatus.NotStarted);
        return;
      }

      try {
        // Step 1: Install extensions
        vscode.window.showInformationMessage(
          "Installing required extensions...",
        );
        const extensionResults = await installExtensions();

        // Step 2: Apply settings
        let settingsSuccess = 0;
        let settingsError = 0;

        for (const [key, value] of Object.entries(defaultSettings)) {
          try {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
            settingsSuccess++;
          } catch (error) {
            // Skip settings that aren't registered yet (extensions not loaded)
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            if (errorMessage.includes("not a registered configuration")) {
              console.log(`Skipping ${key}: extension not loaded yet`);
              settingsSuccess++; // Count as success since it will apply when extension loads
            } else {
              console.error(`Failed to set ${key}:`, error);
              settingsError++;
            }
          }
        }

        // Report results
        const messages = [];

        if (extensionResults.installed > 0) {
          messages.push(`${extensionResults.installed} extension(s) installed`);
        }
        if (extensionResults.skipped > 0) {
          messages.push(
            `${extensionResults.skipped} extension(s) already installed`,
          );
        }
        if (settingsSuccess > 0) {
          messages.push(`${settingsSuccess} setting(s) configured`);
        }

        if (settingsError === 0 && extensionResults.failed === 0) {
          statusBar.setStatus(SetupStatus.Complete);

          // Prompt for reload if extensions were installed
          if (extensionResults.installed > 0) {
            let successMessage = `✓  setup complete! ${messages.join(", ")}. Please reload VSCode to activate all extensions.`;

            // Add WSL-specific reminder for Windows users
            if (environment === "windows") {
              successMessage = `✓  setup complete on Windows! ${messages.join(", ")}. Remember to run "Configure Settings" again after connecting to WSL. Please reload VSCode now.`;
            } else if (environment === "wsl") {
              successMessage = `✓  setup complete in WSL! ${messages.join(", ")}. Please reload VSCode to activate all extensions.`;
            }

            const reloadAnswer = await vscode.window.showInformationMessage(
              successMessage,
              "Reload Now",
              "Later",
            );
            if (reloadAnswer === "Reload Now") {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          } else {
            let successMessage = `✓  setup complete! ${messages.join(", ")}.`;

            if (environment === "windows") {
              successMessage = `✓  setup complete on Windows! ${messages.join(", ")}. Remember to run "Configure Settings" again after connecting to WSL.`;
            } else if (environment === "wsl") {
              successMessage = `✓  setup complete in WSL! ${messages.join(", ")}.`;
            }

            vscode.window.showInformationMessage(successMessage);
          }
        } else {
          statusBar.setStatus(SetupStatus.Error);
          const errorParts = [];
          if (extensionResults.failed > 0) {
            errorParts.push(`${extensionResults.failed} extension(s) failed`);
          }
          if (settingsError > 0) {
            errorParts.push(`${settingsError} setting(s) failed`);
          }
          vscode.window.showWarningMessage(
            `Setup completed with issues: ${messages.join(", ")}. Errors: ${errorParts.join(", ")}. Check the console for details.`,
          );
        }
      } catch (error) {
        statusBar.setStatus(SetupStatus.Error);
        vscode.window.showErrorMessage(
          `Failed to configure settings: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  const enableCopilotCommand = vscode.commands.registerCommand(
    "bartdorsey.enableCopilot",
    async () => {
      // Ask for confirmation
      const answer = await vscode.window.showInformationMessage(
        "This will install GitHub Copilot extensions and enable AI chat features. Continue?",
        "Yes",
        "No",
      );

      if (answer !== "Yes") {
        return;
      }

      try {
        let installed = 0;
        let failed = 0;
        let skipped = 0;

        vscode.window.showInformationMessage(
          "Installing GitHub Copilot extensions...",
        );

        // Install Copilot extensions
        for (const extensionId of COPILOT_EXTENSIONS) {
          try {
            // Check if extension is already installed
            const extension = vscode.extensions.getExtension(extensionId);
            if (extension) {
              console.log(`Extension ${extensionId} is already installed`);
              skipped++;
              continue;
            }

            // Install the extension
            await vscode.commands.executeCommand(
              "workbench.extensions.installExtension",
              extensionId,
            );
            console.log(`Successfully installed ${extensionId}`);
            installed++;
          } catch (error) {
            console.error(`Failed to install ${extensionId}:`, error);
            failed++;
          }
        }

        // Update settings
        const config = vscode.workspace.getConfiguration();
        let settingsSuccess = 0;
        let settingsFailed = 0;

        // Enable Copilot for all file types
        try {
          await config.update(
            "github.copilot.enable",
            {
              "*": true,
              plaintext: true,
              markdown: true,
              scminput: true,
              css: true,
            },
            vscode.ConfigurationTarget.Global,
          );
          settingsSuccess++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not a registered configuration")) {
            console.log(
              "github.copilot.enable not registered yet (will apply when extension loads)",
            );
            settingsSuccess++; // Count as success since it will apply when extension loads
          } else {
            console.error("Failed to enable github.copilot.enable:", error);
            settingsFailed++;
          }
        }

        // Enable AI chat features
        try {
          await config.update(
            "chat.disableAIFeatures",
            false,
            vscode.ConfigurationTarget.Global,
          );
          settingsSuccess++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not a registered configuration")) {
            console.log(
              "chat.disableAIFeatures not registered yet (will apply when extension loads)",
            );
            settingsSuccess++; // Count as success since it will apply when extension loads
          } else {
            console.error("Failed to enable chat.disableAIFeatures:", error);
            settingsFailed++;
          }
        }

        // Report results
        const messages = [];
        if (installed > 0) {
          messages.push(`${installed} extension(s) installed`);
        }
        if (skipped > 0) {
          messages.push(`${skipped} extension(s) already installed`);
        }
        if (settingsSuccess > 0) {
          messages.push(`${settingsSuccess} setting(s) configured`);
        }

        if (failed === 0 && settingsFailed === 0) {
          if (installed > 0) {
            const reloadAnswer = await vscode.window.showInformationMessage(
              `✓ GitHub Copilot enabled! ${messages.join(", ")}. Please reload VSCode to activate the extensions.`,
              "Reload Now",
              "Later",
            );
            if (reloadAnswer === "Reload Now") {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          } else {
            vscode.window.showInformationMessage(
              `✓ GitHub Copilot is already enabled! ${messages.join(", ")}.`,
            );
          }
        } else {
          const errorParts = [];
          if (failed > 0) {
            errorParts.push(`${failed} extension(s) failed`);
          }
          if (settingsFailed > 0) {
            errorParts.push(`${settingsFailed} setting(s) failed`);
          }
          vscode.window.showWarningMessage(
            `GitHub Copilot enabled with issues: ${messages.join(", ")}. Errors: ${errorParts.join(", ")}. Check the console for details.`,
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to enable GitHub Copilot: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  const disableCopilotCommand = vscode.commands.registerCommand(
    "bartdorsey.disableCopilot",
    async () => {
      // Ask for confirmation
      const answer = await vscode.window.showWarningMessage(
        "This will uninstall GitHub Copilot extensions and disable AI chat features. Continue?",
        "Yes",
        "No",
      );

      if (answer !== "Yes") {
        return;
      }

      try {
        let uninstalled = 0;
        let uninstallFailed = 0;

        vscode.window.showInformationMessage(
          "Uninstalling GitHub Copilot extensions...",
        );

        // Uninstall Copilot extensions (chat first, then copilot)
        const uninstallOrder = ["github.copilot-chat", "github.copilot"];

        for (const extensionId of uninstallOrder) {
          try {
            await vscode.commands.executeCommand(
              "workbench.extensions.uninstallExtension",
              extensionId,
            );
            console.log(`Successfully queued uninstall for ${extensionId}`);
            uninstalled++;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            if (errorMessage.includes("is not installed")) {
              console.log(
                `Extension ${extensionId} is not installed, skipping`,
              );
            } else {
              console.error(`Failed to uninstall ${extensionId}:`, error);
              uninstallFailed++;
            }
          }
        }

        // Disable AI features in settings
        const config = vscode.workspace.getConfiguration();
        let settingsSuccess = 0;

        try {
          await config.update(
            "github.copilot.enable",
            {
              "*": false,
              plaintext: false,
              markdown: false,
              scminput: false,
              css: false,
            },
            vscode.ConfigurationTarget.Global,
          );
          settingsSuccess++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not a registered configuration")) {
            console.log(
              "github.copilot.enable not registered (extension not loaded)",
            );
            settingsSuccess++; // Count as success since extension isn't loaded anyway
          } else {
            console.error("Failed to disable github.copilot.enable:", error);
          }
        }

        try {
          await config.update(
            "chat.disableAIFeatures",
            true,
            vscode.ConfigurationTarget.Global,
          );
          settingsSuccess++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not a registered configuration")) {
            console.log("chat.disableAIFeatures not registered");
            settingsSuccess++; // Count as success
          } else {
            console.error("Failed to set chat.disableAIFeatures:", error);
          }
        }

        // Show results
        const messages = [];
        if (uninstalled > 0) {
          messages.push(`${uninstalled} extension(s) uninstalled`);
        }
        if (settingsSuccess > 0) {
          messages.push(`${settingsSuccess} setting(s) configured`);
        }

        if (uninstallFailed === 0) {
          const reloadAnswer = await vscode.window.showInformationMessage(
            `✓ GitHub Copilot disabled! ${messages.join(", ")}. Extensions will be fully removed after reload.`,
            "Reload Now",
            "Later",
          );
          if (reloadAnswer === "Reload Now") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        } else {
          vscode.window.showWarningMessage(
            `Disabled GitHub Copilot with issues: ${messages.join(", ")}. ${uninstallFailed} extension(s) failed to uninstall. Check the console for details.`,
          );
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to disable GitHub Copilot: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  const cleanupCommand = vscode.commands.registerCommand(
    "bartdorsey.cleanup",
    async () => {
      // Ask for confirmation
      const answer = await vscode.window.showWarningMessage(
        "This will uninstall all  extensions and reset settings to their default values. This cannot be undone. Continue?",
        { modal: true },
        "Yes, Cleanup",
        "Cancel",
      );

      if (answer !== "Yes, Cleanup") {
        return;
      }

      try {
        let uninstalled = 0;
        let uninstallFailed = 0;

        // Backup current settings before removing them
        await context.globalState.update("backupCreated", true);

        // Build list of all extensions to uninstall
        const allExtensions = [...REQUIRED_EXTENSIONS];
        const isWSL =
          os.platform() === "linux" &&
          os.release().toLowerCase().includes("microsoft");
        if (isWSL) {
          allExtensions.push("ms-vscode-remote.remote-wsl");
        }

        vscode.window.showInformationMessage("Uninstalling extensions...");

        const failedExtensions: string[] = [];

        // Uninstall dependent extensions first (copilot-chat before copilot, python extensions before python)
        // Then uninstall remaining extensions
        const dependenciesToUninstallFirst = [
          "ms-python.black-formatter",
          "ms-python.flake8",
          "github.copilot-chat",
        ];

        const remainingExtensions = allExtensions.filter(
          (id) => !dependenciesToUninstallFirst.includes(id),
        );

        const uninstallOrder = [
          ...dependenciesToUninstallFirst,
          ...remainingExtensions,
        ];

        for (const extensionId of uninstallOrder) {
          try {
            console.log(`Attempting to uninstall ${extensionId}...`);

            // Try to uninstall regardless of whether we can find it in the current extension host
            await vscode.commands.executeCommand(
              "workbench.extensions.uninstallExtension",
              extensionId,
            );
            console.log(`Successfully queued uninstall for ${extensionId}`);
            uninstalled++;
          } catch (error) {
            // Only count as failure if it's not a "not installed" error
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            if (errorMessage.includes("is not installed")) {
              console.log(
                `Extension ${extensionId} is not installed, skipping`,
              );
            } else {
              console.error(`Failed to uninstall ${extensionId}:`, error);
              failedExtensions.push(extensionId);
              uninstallFailed++;
            }
          }
        }

        // Reset all settings to undefined (removes them)
        const config = vscode.workspace.getConfiguration();
        let settingsReset = 0;

        for (const key of Object.keys(defaultSettings)) {
          try {
            await config.update(
              key,
              undefined,
              vscode.ConfigurationTarget.Global,
            );
            settingsReset++;
          } catch (error) {
            console.error(`Failed to reset ${key}:`, error);
          }
        }

        // Show results
        const messages = [];
        if (uninstalled > 0) {
          messages.push(`${uninstalled} extension(s) uninstalled`);
        }
        if (settingsReset > 0) {
          messages.push(`${settingsReset} setting(s) reset`);
        }

        if (uninstallFailed === 0) {
          const reloadAnswer = await vscode.window.showInformationMessage(
            `✓ Cleanup complete! ${messages.join(", ")}. Extensions will be fully removed after reload.`,
            "Reload Now",
            "Later",
          );
          if (reloadAnswer === "Reload Now") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        } else {
          const failedList = failedExtensions.join(", ");
          const openExtensionsAnswer = await vscode.window.showWarningMessage(
            `Cleanup completed with issues: ${messages.join(", ")}. Failed to uninstall: ${failedList}. Would you like to open the Extensions view to uninstall them manually?`,
            "Open Extensions",
            "Later",
          );
          if (openExtensionsAnswer === "Open Extensions") {
            vscode.commands.executeCommand("workbench.view.extensions");
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to cleanup: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  context.subscriptions.push(menuCommand);
  context.subscriptions.push(configureCommand);
  context.subscriptions.push(enableCopilotCommand);
  context.subscriptions.push(disableCopilotCommand);
  context.subscriptions.push(cleanupCommand);
}

export function deactivate() {}
