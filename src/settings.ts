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
export const defaultSettings: Record<string, any> = {
  // Workbench settings
  "workbench.tree.indent": 20,
  "workbench.editor.labelFormat": "short",
  "workbench.iconTheme": "vscode-jetbrains-icon-theme-2023-auto",

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

  // Copilot settings - disabled by default
  "github.copilot.enable": {
    "*": false,
    plaintext: false,
    markdown: false,
    scminput: false,
    css: false,
  },
  "chat.disableAIFeatures": true,

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
};
