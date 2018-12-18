/**
 * startEditors.ts
 *
 * Initialization for the core set of editors
 */

import { OniEditor } from "./Editor/OniEditor"

import { PluginManager } from "./Plugins/PluginManager"

import { Colors } from "./Services/Colors"
import { CompletionProviders } from "./Services/Completion"
import { Configuration } from "./Services/Configuration"
import { IDiagnosticsDataSource } from "./Services/Diagnostics"
import { LanguageManager } from "./Services/Language"
import { MenuManager } from "./Services/Menu"
import { OverlayManager } from "./Services/Overlay"
import { SnippetManager } from "./Services/Snippets"
import { ThemeManager } from "./Services/Themes"
import { TokenColors } from "./Services/TokenColors"
import { windowManager } from "./Services/WindowManager"
import { Workspace } from "./Services/Workspace"

export const startEditors = async (
    filesToOpen: string[],
    additionalArgs: string[],
    colors: Colors,
    completionProviders: CompletionProviders,
    configuration: Configuration,
    diagnostics: IDiagnosticsDataSource,
    languageManager: LanguageManager,
    menuManager: MenuManager,
    overlayManager: OverlayManager,
    pluginManager: PluginManager,
    snippetManager: SnippetManager,
    themeManager: ThemeManager,
    tokenColors: TokenColors,
    workspace: Workspace,
): Promise<void> => {
    const editor = new OniEditor(
        colors,
        completionProviders,
        configuration,
        diagnostics,
        languageManager,
        menuManager,
        overlayManager,
        pluginManager,
        snippetManager,
        themeManager,
        tokenColors,
        workspace,
    )
    windowManager.createSplit("horizontal", editor)

    await editor.init(filesToOpen, additionalArgs);
}
