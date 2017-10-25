/**
 * Completion.ts
 */

// import * as os from "os"
// import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

import { editorManager } from "./../EditorManager"
import { languageManager } from "./LanguageManager"
import { workspace } from "./../Workspace"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// import * as AutoCompletionUtility from "./../AutoCompletionUtility"

export const doRename = async (newName: string): Promise<void> => {

    const activeBuffer = editorManager.activeEditor.activeBuffer

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(activeBuffer.filePath),
            },
            position: {
                line: activeBuffer.cursor.line,
                character: activeBuffer.cursor.column,
            },
            newName,
        }

        let result = null
        try {
        result = await languageManager.sendLanguageServerRequest(activeBuffer.language, activeBuffer.filePath, "textDocument/rename", args)
        } catch(ex) { }

        if (result) {
            await workspace.applyEdits(result)
        }
}
