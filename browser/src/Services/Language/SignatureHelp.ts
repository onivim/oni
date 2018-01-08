/**
 * SignatureHelp.ts
 *
 */

import { Observable } from "rxjs/Observable"
import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import * as Log from "./../../Log"
import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { IToolTipsProvider } from "./../../Editor/NeovimEditor/ToolTipsProvider"
import { editorManager } from "./../EditorManager"

import { ILatestCursorAndBufferInfo } from "./addInsertModeLanguageFunctionality"
import * as LanguageManager from "./LanguageManager"
import * as SignatureHelp from "./SignatureHelpView"

export const initUI = (latestCursorAndBufferInfo$: Observable<ILatestCursorAndBufferInfo>, modeChanged$: Observable<Oni.Vim.Mode>, toolTips: IToolTipsProvider) => {

    const signatureHelpToolTipName = "signature-help-tool-tip"

    // Show signature help as the cursor moves
    latestCursorAndBufferInfo$
        .flatMap(async (val) => {
            return await showSignatureHelp(val.language, val.filePath, val.cursorLine, val.cursorColumn)
        })
        .subscribe((result) => {
            if (result) {
                toolTips.showToolTip(signatureHelpToolTipName, SignatureHelp.render(result), {
                    position: null,
                    openDirection: 1,
                    padding: "0px",
                })
            } else {
                toolTips.hideToolTip(signatureHelpToolTipName)
            }
        })

    // Hide signature help when we leave insert mode
    modeChanged$
        .subscribe((newMode) => {
            if (newMode !== "insert") {
                toolTips.hideToolTip(signatureHelpToolTipName)
            }
        })
}

export const showSignatureHelp = async (language: string, filePath: string, line: number, column: number): Promise<types.SignatureHelp> => {
    const languageManager = LanguageManager.getInstance()
    if (languageManager.isLanguageServerAvailable(language)) {

        const buffer = editorManager.activeEditor.activeBuffer
        const currentLine = await buffer.getLines(line, line + 1)

        const requestColumn = getSignatureHelpTriggerColumn(currentLine[0], column, ["("])

        if (requestColumn < 0) {
            return null
        }

        const args = {
            textDocument: {
                uri: Helpers.wrapPathInFileUri(filePath),
            },
            position: {
                line,
                character: column,
            },
        }

        let result: types.SignatureHelp = null
        try {
            result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/signatureHelp", args)
        } catch (ex) { Log.debug(ex) }

        return result
    } else {
        return null
    }
}

// TODO: `getSignatureHelpTriggerColumn` rename to `getNearestTriggerCharacter`
export const getSignatureHelpTriggerColumn = (line: string, character: number, triggerCharacters: string[]): number => {

    let idx = character
    while (idx >= 0) {
        if (line[idx] === triggerCharacters[0]) {
            break
        }

        idx--
    }

    return idx
}
