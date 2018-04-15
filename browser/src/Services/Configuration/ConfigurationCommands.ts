/**
 * ConfigurationCommands
 */

import { CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"

import { Configuration } from "./Configuration"
import { ConfigurationEditManager } from "./ConfigurationEditor"

import { getUserConfigFilePath } from "./index"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
) => {
    const configurationEditManager = new ConfigurationEditManager(configuration, editorManager)

    commandManager.registerCommand({
        command: "oni.config.openUserConfig",
        name: "Configuration: Edit User Config",
        detail: "Edit user configuration file for Oni",
        execute: () => configurationEditManager.editConfiguration(getUserConfigFilePath()),
    })

    commandManager.registerCommand({
        command: "oni.config.openConfigJs",
        name: null,
        detail: null,
        execute: () => configurationEditManager.editConfiguration(getUserConfigFilePath()),
    })
}
