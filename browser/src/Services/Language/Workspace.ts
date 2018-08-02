/**
 * Workspace.ts
 *
 * Handles workspace/ messages
 */

import * as Oni from "oni-api"
import * as types from "vscode-languageserver-types"

import { LanguageManager } from "./LanguageManager"

export const listenForWorkspaceEdits = (languageManager: LanguageManager, oni: Oni.Plugin.Api) => {
    const workspace = oni.workspace
    languageManager.handleLanguageServerRequest("workspace/applyEdit", async (args: any) => {
        const payload: types.WorkspaceEdit = args.payload.edit.changes
        await workspace.applyEdits(payload)
        return {
            applied: true,
        }
    })
}
