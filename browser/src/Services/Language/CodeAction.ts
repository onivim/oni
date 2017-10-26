/**
 * CodeAction.ts
 *
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

import { contextMenuManager } from "./../ContextMenu"
import { languageManager } from "./LanguageManager"

// import * as Log from "./../../Log"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

let codeActionsContextMenu = contextMenuManager.create()

let lastCommands: types.Command[] = []
let lastFileInfo: any = {}

codeActionsContextMenu.onItemSelected.subscribe(async (selectedItem) => {

    const commandName = selectedItem.data
    await languageManager.sendLanguageServerRequest(lastFileInfo.language, lastFileInfo.filePath, "workspace/executeCommand", { command: commandName })
})

export const checkCodeActions = async (language: string, filePath: string, line: number, column: number) => {

    if (languageManager.isLanguageServerAvailable(language)) {
        const result: types.Command[] = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/codeAction",
            Helpers.eventContextToCodeActionParams(filePath, line, column))

        // TODO:
        if (result) {
            console.dir(result)
        }

        lastCommands = result
        lastFileInfo = {
            language,
            filePath,
        }
    }
}

export const expandCodeActions = () => {
    if (!lastCommands || !lastCommands.length) {
        return
    }

    const mapCommandsToItem = (command: types.Command) => ({
        label: command.title,
        icon: "wrench",
        data: command.command,
    })

    const contextMenuItems = lastCommands.map((c) => mapCommandsToItem(c))

    codeActionsContextMenu.show(contextMenuItems)
}
