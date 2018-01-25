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
import { editorManager } from "./Services/EditorManager"
import { LanguageManager } from "./Services/Language"
import { MenuManager } from "./Services/Menu"
import { OverlayManager } from "./Services/Overlay"
import { Tasks } from "./Services/Tasks"
import { ThemeManager } from "./Services/Themes"
import { windowManager } from "./Services/WindowManager"
import { Workspace } from "./Services/Workspace"

export const startEditors = async (
    args: any,
    colors: Colors,
    completionProviders: CompletionProviders,
    configuration: Configuration,
    diagnostics: IDiagnosticsDataSource,
    languageManager: LanguageManager,
    menuManager: MenuManager,
    overlayManager: OverlayManager,
    pluginManager: PluginManager,
    tasks: Tasks,
    themeManager: ThemeManager,
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
        tasks,
        themeManager,
        workspace,
    )
    editorManager.setActiveEditor(editor)
    windowManager.split(0, editor)

    await editor.init(args)
}
