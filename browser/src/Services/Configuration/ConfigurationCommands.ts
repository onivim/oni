/**
 * ConfigurationCommands
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"

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
        command: "oni.config.openConfigJs",
        name: "Configuration: Edit User Config",
        detail: "Edit user configuration file for Oni",
        execute: () => configurationEditManager.editConfiguration(getUserConfigFilePath()),
    })
}
