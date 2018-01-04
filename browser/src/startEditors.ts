/**
 * startEditors.ts
 *
 * Initialization for the core set of editors
 */

import { NeovimEditor } from "./Editor/NeovimEditor"

import { Colors } from "./Services/Colors"
import { commandManager } from "./Services/CommandManager"
import { Configuration } from "./Services/Configuration"
import { IDiagnosticsDataSource } from "./Services/Diagnostics"
import { editorManager } from "./Services/EditorManager"
import { ExplorerSplit } from "./Services/Explorer/ExplorerSplit"
import { LanguageManager } from "./Services/Language"
import { SidebarSplit } from "./Services/Sidebar"
import { ThemeManager } from "./Services/Themes"
import { windowManager } from "./Services/WindowManager"
import { workspace } from "./Services/Workspace"

export const startEditors = async (args: any, colors: Colors, configuration: Configuration, diagnostics: IDiagnosticsDataSource, languageManager: LanguageManager, themeManager: ThemeManager): Promise<void> => {

    if (configuration.getValue("experimental.sidebar.enabled")) {
        const leftDock = windowManager.getDock(2)
        leftDock.addSplit(new SidebarSplit())
        leftDock.addSplit(new ExplorerSplit(configuration, workspace, commandManager, editorManager))
    }

    const editor = new NeovimEditor(colors, configuration, diagnostics, languageManager, themeManager)
    editorManager.setActiveEditor(editor)
    windowManager.split(0, editor)

    await editor.init(args)
}
