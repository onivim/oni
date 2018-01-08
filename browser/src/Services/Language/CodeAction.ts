/**
 * CodeAction.ts
 *
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

// import { contextMenuManager } from "./../ContextMenu"
import * as LanguageManager from "./LanguageManager"

import * as Log from "./../../Log"
import { editorManager } from "./../EditorManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// const codeActionsContextMenu = contextMenuManager.create()

// let lastFileInfo: any = {}

// codeActionsContextMenu.onItemSelected.subscribe(async (selectedItem) => {

//     const commandName = selectedItem.data
//     const languageManager = LanguageManager.getInstance()
//     await languageManager.sendLanguageServerRequest(lastFileInfo.language, lastFileInfo.filePath, "workspace/executeCommand", { command: commandName })
// })

// export const expandCodeActions = async () => {

//     const commands = await getCodeActions()
//     if (!commands || !commands.length) {
//         return
//     }

//     const mapCommandsToItem = (command: types.Command, idx: number) => ({
//         label: command.title,
//         icon: "lightbulb-o",
//         data: command.command,
//     })

//     const contextMenuItems = commands.map(mapCommandsToItem)

//     codeActionsContextMenu.show(contextMenuItems)
// }

export const getCodeActions = async (): Promise<types.Command[]> => {

    const buffer = editorManager.activeEditor.activeBuffer

    const { language, filePath } = buffer
    const range = await buffer.getSelectionRange()

    if (!range) {
        return null
    }

    const languageManager = LanguageManager.getInstance()
    if (languageManager.isLanguageServerAvailable(language)) {
        let result: types.Command[] = null
        try {
            result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/codeAction",
            Helpers.eventContextToCodeActionParams(filePath, range))
        } catch (ex) { Log.verbose(ex) }

        if (!result) {
            return null
        }

        // lastFileInfo = {
        //     language,
        //     filePath,
        // }

        return result
    } else {
        return null
    }
}
