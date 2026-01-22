# VSCode Personal Config Extension - AI Assistant Instructions

## Project Overview

This is a VSCode extension that automates personal environment setup by installing preferred extensions and applying standardized settings. The extension provides a unified interface for configuring development environments across different platforms (Windows, WSL, Linux) with special attention to cross-platform workflows.

## Architecture & Key Components

### Core Files

- **[src/extension.ts](../src/extension.ts)**: Main extension entry point with command handlers and environment detection logic
- **[src/settings.ts](../src/settings.ts)**: Centralized settings configuration with comprehensive editor, language, and tool preferences
- **[src/statusBar.ts](../src/statusBar.ts)**: Environment-aware status bar with visual setup progress indicators

### Extension Management Strategy

The extension manages three categories of extensions with different installation strategies:

- **Required Extensions**: Core development tools including vim, Python, formatters, themes, C/C++, AI tools (OpenCode, Claude), and specialized tools (Typst, Excalidraw, C64 dev)
- **Copilot Extensions**: GitHub AI tools (`github.copilot`, `github.copilot-chat`) managed separately for selective enablement
- **Platform Extensions**: WSL extension added conditionally based on environment detection

### Environment Detection Pattern

Critical cross-platform logic in `getEnvironment()` function:

```typescript
// Detects: "windows" | "wsl" | "linux" | "other"
// Uses both vscode.env.remoteName and os.platform() + os.release()
// Handles edge case: Linux with Microsoft kernel (WSL without Remote-WSL)
```

## Development Workflows

### Build & Development

- **Watch Mode**: `pnpm run watch` - Essential during development for auto-compilation using esbuild
- **Package**: `pnpm run package` - Creates `.vsix` file for distribution
- **Bundle**: `pnpm run bundle` - Production build with esbuild minification
- **Extension Test**: Use F5 in VSCode to launch Extension Development Host

### Settings Management Pattern

All user settings are applied at `vscode.ConfigurationTarget.Global` level. The extension gracefully handles:

- Settings for extensions not yet loaded (logs and continues)
- Cross-platform setting compatibility
- Batch setting application with individual error handling

### Command Architecture

Four main commands with consistent patterns:

- `bartdorsey.showMenu`: Dynamic QuickPick menu that adapts based on current state (no longer in package.json contributes)
- `bartdorsey.configureSettings`: Main setup flow with progress tracking
- `bartdorsey.enableCopilot`/`bartdorsey.disableCopilot`: Toggleable AI feature management
- `bartdorsey.cleanup`: Complete environment reset with confirmation dialogs

## Project-Specific Conventions

### Error Handling Philosophy

- **Graceful Degradation**: Continue setup even if individual extensions/settings fail
- **User Feedback**: Always show success/failure counts in notification messages
- **Console Logging**: Detailed error info in console, user-friendly messages in UI

### Status Bar Integration

- **Environment Labels**: Shows `[Windows]`, `[WSL]`, or `[Linux]` context
- **Visual States**: Rocket (not started), spinning sync (in progress), checkmark (complete), warning (error)
- **Command Integration**: Status bar click opens dynamic menu

### Cross-Platform Considerations

- **WSL Workflow**: Extension prompts Windows users to run setup again after connecting to WSL
- **Extension Contexts**: Different extension sets per environment (WSL extension only on Windows/WSL)
- **Settings Persistence**: Global settings work across all VS Code instances

## Key Implementation Patterns

### Extension Installation Loop

```typescript
// Standard pattern for batch extension installation with environment awareness
let extensionsToInstall = [...REQUIRED_EXTENSIONS];
const environment = getEnvironment();

// Add WSL extension for Windows and WSL environments
if (environment === "windows" || environment === "wsl") {
  extensionsToInstall.push(WSL_EXTENSION);
}

for (const extensionId of extensionsToInstall) {
  const extension = vscode.extensions.getExtension(extensionId);
  if (extension) {
    skipped++;
    continue;
  }

  await vscode.commands.executeCommand(
    "workbench.extensions.installExtension",
    extensionId,
  );
  // Error handling and counting...
}
```

### Configuration Update Pattern

```typescript
// Safe settings application with extension-not-loaded handling
try {
  await config.update(key, value, vscode.ConfigurationTarget.Global);
} catch (error) {
  if (errorMessage.includes("not a registered configuration")) {
    // Extension not loaded yet - will apply when it loads
  }
}
```

### Dependency Order Management

- **Uninstall Order**: Dependencies first (`ms-python.flake8` before `ms-python.python`, `github.copilot-chat` before `github.copilot`)
- **Installation Order**: No specific order needed due to VS Code's dependency resolution
- **Environment-Specific Extensions**: WSL extension only added for Windows and WSL environments

## Testing & Debugging Notes

- Test in multiple environments (Windows, WSL, Linux) due to platform-specific behavior
- Status bar state persists across commands - useful for debugging setup flows
- Extension host reload required after installing extensions to test full functionality
- Console output provides detailed operation logs beyond user notifications
- Use `pnpm run watch` during development for hot reloading with esbuild
- Bundle size optimized with esbuild minification for production releases

## Configuration Philosophy

The [settings.ts](../src/settings.ts) file embodies a "developer productivity first" approach:

- Aggressive type hints and IntelliSense settings
- Consistent formatting across languages (Prettier for JS/TS, Black for Python)
- Conservative auto-import settings to avoid noise
- Specialized language settings (C64 development, Typst, Excalidraw)
- GitHub Copilot disabled by default, enabled explicitly through commands
- Font configuration optimized for development (Iosevka Nerd Font)
