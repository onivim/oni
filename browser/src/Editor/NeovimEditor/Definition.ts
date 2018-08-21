/**
 * Definition.ts
 */

import { Store } from "redux"

import * as Oni from "oni-api"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import * as State from "./NeovimEditorStore"

export enum OpenType {
    NewTab = 0,
    SplitVertical = 1,
    SplitHorizontal = 2,
}

export class Definition {
    constructor(private _editor: Oni.Editor, private _store: Store<State.IState>) {}

    public async gotoDefinitionUnderCursor(openOptions?: Oni.FileOpenOptions): Promise<void> {
        const activeDefinition = this._store.getState().definition

        if (!activeDefinition) {
            return
        }

        const { uri, range } = activeDefinition.definitionLocation

        const line = range.start.line
        const column = range.start.character

        await this.gotoPositionInUri(uri, line, column, openOptions)
    }

    public async gotoPositionInUri(
        uri: string,
        line: number,
        column: number,
        openOptions?: Oni.FileOpenOptions,
    ): Promise<void> {
        const filePath = Helpers.unwrapFileUriPath(uri)

        const activeEditor = this._editor

        await this._editor.openFile(filePath, openOptions)
        await activeEditor.neovim.command(`cal cursor(${line + 1}, ${column + 1})`)
        await activeEditor.neovim.command("norm zz")
    }
}
