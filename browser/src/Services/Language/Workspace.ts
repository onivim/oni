/**
 * Workspace.ts
 *
 * Handles workspace/ messages
 */

import * as types from "vscode-languageserver-types"

import { IWorkspace } from "./../Workspace"

import { LanguageManager } from "./LanguageManager"

export const listenForWorkspaceEdits = (
    languageManager: LanguageManager,
    workspace: IWorkspace,
) => {
    languageManager.handleLanguageServerRequest("workspace/applyEdit", async (args: any) => {
        const payload: types.WorkspaceEdit = args.payload.edit.changes
        await workspace.applyEdits(payload)
        return {
            applied: true,
        }
    })
}
