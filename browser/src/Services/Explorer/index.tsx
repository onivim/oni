/**
 * Explorer/index.tsx
 *
 * Entry point for explorer-related features
 */

import * as Oni from "oni-api"

import { CallbackCommand } from "./../CommandManager"
import { Configuration } from "./../Configuration"
import { SidebarManager } from "./../Sidebar"

import { ExplorerSplit } from "./ExplorerSplit"

export const activate = (
    oni: Oni.Plugin.Api,
    configuration: Configuration,
    sidebarManager: SidebarManager,
) => {
    configuration.registerSetting("explorer.autoRefresh", {
        description:
            "When set to true, the explorer will listen for changes on the file system and refresh automatically.",
        requiresReload: true,
        defaultValue: false,
    })

    const explorerSplit: ExplorerSplit = new ExplorerSplit(oni)
    sidebarManager.add("files-o", explorerSplit)

    const explorerId = "oni.sidebar.explorer"

    oni.commands.registerCommand(
        new CallbackCommand(
            "explorer.toggle",
            "Explorer: Toggle Visibility",
            "Toggles the explorer in the sidebar",
            () => sidebarManager.toggleVisibilityById(explorerId),
            () => !!oni.workspace.activeWorkspace,
        ),
    )

    oni.commands.registerCommand(
        new CallbackCommand(
            "explorer.locate.buffer",
            "Explorer: Locate Current Buffer",
            "Locate current buffer in file tree",
            () => {
                if (sidebarManager.activeEntryId !== explorerId || !sidebarManager.isVisible) {
                    sidebarManager.setActiveEntry(explorerId)
                }
                explorerSplit.locateFile(oni.editors.activeEditor.activeBuffer.filePath)
            },
            () => !!oni.workspace.activeWorkspace,
        ),
    )
}
