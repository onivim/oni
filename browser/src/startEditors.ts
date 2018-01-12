/**
 * startEditors.ts
 *
 * Initialization for the core set of editors
 */

import { NeovimEditor } from "./Editor/NeovimEditor"

import { PluginManager } from "./Plugins/PluginManager"

import { Colors } from "./Services/Colors"
import { Configuration } from "./Services/Configuration"
import { IDiagnosticsDataSource } from "./Services/Diagnostics"
import { editorManager } from "./Services/EditorManager"
import { LanguageManager } from "./Services/Language"
import { ThemeManager } from "./Services/Themes"
import { windowManager } from "./Services/WindowManager"

export const startEditors = async (args: any, colors: Colors, configuration: Configuration, diagnostics: IDiagnosticsDataSource, languageManager: LanguageManager, pluginManager: PluginManager, themeManager: ThemeManager): Promise<void> => {

    const editor = new NeovimEditor(colors, configuration, diagnostics, languageManager, pluginManager, themeManager)
    editorManager.setActiveEditor(editor)
    windowManager.split(0, editor)

    await editor.init(args)
}
