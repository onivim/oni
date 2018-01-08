/**
 * startEditors.ts
 *
 * Initialization for the core set of editors
 */

import { NeovimEditor } from "./Editor/NeovimEditor"

import { Colors } from "./Services/Colors"
import { Configuration } from "./Services/Configuration"
import { IDiagnosticsDataSource } from "./Services/Diagnostics"
import { LanguageManager } from "./Services/Language"
import { ThemeManager } from "./Services/Themes"
import { windowManager } from "./Services/WindowManager"

export const startEditors = async (args: any, colors: Colors, configuration: Configuration, diagnostics: IDiagnosticsDataSource, languageManager: LanguageManager, themeManager: ThemeManager): Promise<void> => {

    const editor = new NeovimEditor(colors, configuration, diagnostics, languageManager, themeManager)
    windowManager.split(0, editor)

    await editor.init(args)
}
