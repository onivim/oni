/**
 * startEditors.ts
 *
 * Initialization for the core set of editors
 */

import { NeovimEditor } from "./Editor/NeovimEditor"

import { PluginManager } from "./Plugins/PluginManager"

import { Colors } from "./Services/Colors"
import { CompletionProviders } from "./Services/Completion"
import { Configuration } from "./Services/Configuration"
import { IDiagnosticsDataSource } from "./Services/Diagnostics"
import { editorManager } from "./Services/EditorManager"
import { LanguageManager } from "./Services/Language"
import { ThemeManager } from "./Services/Themes"
import { windowManager } from "./Services/WindowManager"
import { Workspace } from "./Services/Workspace"

export const startEditors = async (args: any, colors: Colors, completionProviders: CompletionProviders, configuration: Configuration, diagnostics: IDiagnosticsDataSource, languageManager: LanguageManager, pluginManager: PluginManager, themeManager: ThemeManager, workspace: Workspace): Promise<void> => {

    const editor = new NeovimEditor(colors, completionProviders, configuration, diagnostics, languageManager, pluginManager, themeManager, workspace)
    editorManager.setActiveEditor(editor)
    windowManager.split(0, editor)

    await editor.init(args)
}
