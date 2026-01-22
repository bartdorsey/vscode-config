/**
 * Comprehensive VS Code settings configuration optimized for developer productivity.
 * Includes settings for workbench appearance, editor behavior, language-specific formatting,
 * and cross-platform compatibility. All settings are applied at the Global configuration target.
 *
 * Key philosophy:
 * - Aggressive type hints and IntelliSense for better code understanding
 * - Consistent formatting across languages (Prettier for JS/TS, Black for Python)
 * - Conservative auto-import settings to reduce noise
 * - GitHub Copilot disabled by default, enabled explicitly through commands
 */

export type Environment = "windows" | "wsl" | "linux" | "other";

/**
 * Settings that apply to all operating systems
 */
const commonSettings: Record<string, any> = {
  // Workbench settings
  "workbench.tree.indent": 20,
  "workbench.editor.labelFormat": "short",
  "workbench.iconTheme": "vscode-jetbrains-icon-theme-2023-auto",
  "workbench.startupEditor": "none",
  "workbench.colorTheme": "Gruvbox Dark Hard",

  // Explorer settings
  "explorer.compactFolders": false,

  // Editor settings
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "editor.inlayHints.enabled": "offUnlessPressed",
  "editor.rulers": [80],
  "editor.minimap.enabled": false,
  "editor.wordWrap": "wordWrapColumn",
  "editor.wrappingStrategy": "advanced",
  "editor.fontFamily": "Iosevka Nerd Font",

  // Git
  "git.openRepositoryInParentFolders": "always",
  "git.autofetch": true,

  // Copilot settings - disabled by default
  "github.copilot.enable": {
    "*": false,
    plaintext: false,
    markdown: false,
    scminput: false,
    css: false,
  },
  "chat.disableAIFeatures": false,

  // ErrorLens
  "errorLens.problemRangeDecorationEnabled": true,
  "errorLens.gutterIconSet": "square",
  "errorLens.followCursor": "closestProblem",

  // Files settings
  "files.trimTrailingWhitespace": true,
  "files.trimFinalNewlines": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.venv": true,
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.vscode": false,
  },

  // Markdown
  "markdown-mermaid.lightModeTheme": "dark",
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  // Emmet
  "emmet.includeLanguages": {
    "django-html": "html",
    "jinja-html": "html",
    javascript: "javascriptreact",
  },
  // YAML
  "redhat.telemetry.enabled": false,

  // Terminal settings
  "terminal.integrated.scrollback": 10000,

  // JavaScript/TypeScript settings
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "javascript.suggest.autoImports": false,
  "typescript.suggest.autoImports": false,
  "javascript.inlayHints.functionLikeReturnTypes.enabled": true,
  "javascript.inlayHints.parameterNames.enabled": "all",
  "javascript.inlayHints.parameterTypes.enabled": true,
  "javascript.inlayHints.propertyDeclarationTypes.enabled": true,
  "javascript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.enumMemberValues.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.parameterTypes.enabled": true,
  "typescript.inlayHints.propertyDeclarationTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "totalTypeScript.hideAllTips": false,
  "totalTypeScript.hideBasicTips": false,

  // Python settings
  "python.analysis.autoImportCompletions": false,
  "python.analysis.typeCheckingMode": "standard",
  "python.analysis.diagnosticMode": "workspace",
  "python.analysis.completeFunctionParens": true,
  "python.analysis.generateWithTypeAnnotation": true,
  "python.analysis.inlayHints.callArgumentNames": "all",
  "python.analysis.inlayHints.functionReturnTypes": true,
  "python.analysis.inlayHints.variableTypes": true,
  "python.analysis.typeEvaluation.strictDictionaryInference": true,
  "python.analysis.typeEvaluation.strictListInference": true,
  "python.analysis.typeEvaluation.strictSetInference": true,
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter",
  },

  // HTML Formatting
  "html.format.indentInnerHtml": true,

  // CSS
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },

  // Vim
  "vim.vimrc.path": "$HOME/.config/vim/vimrc",
  "vim.vimrc.enable": true,
  "vim.neovimUseConfigFile": true,
  "vim.leader": "<space>",
  "vim.highlightedyank.enable": true,
  "vim.useSystemClipboard": true,
  "vim.sneak": true,
  "vim.sneakReplacesF": true,
  "open-in-vim.useNeovim": true,
  "vim.normalModeKeyBindingsNonRecursive": [
    {
      before: ["<leader>", "/"],
      after: ["<leader>", "<leader>", "s"],
    },
  ],
  "vim.normalModeKeyBindings": [
    {
      before: ["<leader>", "f", "f"],
      commands: ["television.ToggleFileFinder"],
    },
    {
      before: ["<leader>", "f", "r"],
      commands: ["television.ToggleTextFinder"],
    },
    {
      before: ["<leader>", "<space>"],
      commands: ["workbench.action.showAllEditors"],
    },
  ],
};

/**
 * Windows-specific settings (primarily development tool paths)
 */
const windowsSettings: Record<string, any> = {
  // vs64 (C64 development tools - Windows paths)
  "vs64.showWelcome": false,
  "vs64.kickInstallDir": "E:\\c64\\coding\\KickAssembler",
  "vs64.acmeInstallDir": "E:\\c64\\coding",
  "vs64.viceExecutable": "E:\\GTK3VICE-3.10-win64\\bin\\x64sc.exe",
  "vs64.llvmInstallDir": "E:\\c64\\coding\\llvm-mos",
  "vs64.cc65InstallDir": "C:\\Users\\bart\\scoop\\apps\\cc65\\current",
  "vs64.oscar64InstallDir": "C:\\Program Files\\Oscar64",
};

/**
 * Linux-specific settings (currently empty, but available for future use)
 */
const linuxSettings: Record<string, any> = {
  // Future Linux-specific settings can go here
};

/**
 * WSL-specific settings (currently empty, but available for future use)
 */
const wslSettings: Record<string, any> = {
  // Future WSL-specific settings can go here
};

/**
 * Combines common settings with OS-specific settings based on environment
 * @param environment The detected environment: "windows" | "wsl" | "linux" | "other"
 * @returns Merged settings object appropriate for the current environment
 */
export function getSettingsForEnvironment(
  environment: "windows" | "wsl" | "linux" | "other",
): Record<string, any> {
  let osSpecificSettings: Record<string, any> = {};

  switch (environment) {
    case "windows":
      osSpecificSettings = windowsSettings;
      break;
    case "wsl":
      osSpecificSettings = { ...windowsSettings, ...wslSettings };
      break;
    case "linux":
      osSpecificSettings = linuxSettings;
      break;
    case "other":
      // No OS-specific settings for unrecognized environments
      break;
  }

  return { ...commonSettings, ...osSpecificSettings };
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use getSettingsForEnvironment() instead
 */
export const defaultSettings = commonSettings;
