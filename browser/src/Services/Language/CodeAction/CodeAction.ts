/**
 * CodeAction.ts
 *
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

// import { contextMenuManager } from "./../../ContextMenu"
import { languageManager } from "./../LanguageManager"

import * as Log from "./../../../Log"
import { editorManager } from "./../../EditorManager"

import * as Helpers from "./../../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// const codeActionsContextMenu = contextMenuManager.create()

import { ICodeActionQuery } from "./CodeActionStore"

interface ICodeActionResult {
    query: ICodeActionQuery
    commands: types.Command[]
}

const EmptyCommands: types.Command[] = []

export const getCodeActions = async (range: types.Range): Promise<ICodeActionResult> => {

    const buffer = editorManager.activeEditor.activeBuffer

    const { language, filePath } = buffer

    const result = {
        query: {
            language,
            filePath,
            range,
        },
        commands: EmptyCommands,
    }

    if (!range) {
        return result
    }

    if (languageManager.isLanguageServerAvailable(language)) {
        let commands: types.Command[] = null
        try {
            commands = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/codeAction",
            Helpers.eventContextToCodeActionParams(filePath, range))
        } catch (ex) { Log.verbose(ex) }

        if (!commands) {
            return result
        }

        return {
            ...result,
            commands,
        }
    } else {
        return result
    }
}
