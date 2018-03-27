/**
 * ConfigurationCommands
 */

import { CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"
import { Notifications } from "./../Notifications"

import { Configuration } from "./Configuration"
import { ConfigurationEditManager } from "./ConfigurationEditor"

import { getUserConfigFilePath } from "./index"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
    notifications: Notifications,
) => {
    const configurationEditManager = new ConfigurationEditManager(configuration, editorManager)

    configurationEditManager.onEditError.subscribe(error => {
        const notification = notifications.createItem()
        notification.setLevel("error")
        notification.setContents("Configuration Error", error.toString())
        notification.show()
    })

    configurationEditManager.onEditSuccess.subscribe(() => {
        const notification = notifications.createItem()
        notification.setLevel("success")
        notification.setContents(
            "Configuration Applied",
            "Your configuration changes have been applied.",
        )
        notification.show()
    })

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
