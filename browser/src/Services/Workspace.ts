/**
 * Workspace.ts
 *
 * The 'workspace' is responsible for managing the state of the current project:
 *  - The current / active directory (and 'Open Folder')
 */

import * as types from "vscode-languageserver-types"

import { editorManager } from "./EditorManager"

import * as Helpers from "./../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { Event, IEvent } from "./../Event"

export class Workspace implements Oni.Workspace {
    private _onDirectoryChangedEvent = new Event<string>()

    public get onDirectoryChanged(): IEvent<string> {
        return this._onDirectoryChangedEvent
    }

    public changeDirectory(newDirectory: string) {
        process.chdir(newDirectory)
        this._onDirectoryChangedEvent.dispatch(newDirectory)
    }

    public async applyEdits(edits: types.WorkspaceEdit): Promise<void> {

        if (edits.documentChanges) {
            console.warn("documentChanges not implemented yet")
            return
        }

        const files = Object.keys(edits)

        // Show modal to grab input
        // await editorManager.activeEditor.openFiles(files)

        await files.map(async (fileUri) => {
            const changes = edits[fileUri]
            const fileName = Helpers.unwrapFileUriPath(fileUri)
            // TODO: Sort changes?
            const buf = await editorManager.activeEditor.openFile(fileName)
            await buf.applyTextEdits(changes)
        })
        // Hide modal
    }
}

export const workspace = new Workspace()
