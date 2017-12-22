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

    constructor(
        private _editor: Oni.Editor,
        private _store: Store<State.IState>,
    ) { }

    public async gotoDefinitionUnderCursor(openType: OpenType = OpenType.NewTab): Promise<void> {
        const activeDefinition = this._store.getState().definition

        if (!activeDefinition) {
            return
        }

        const { uri, range } = activeDefinition.definitionLocation

        const line = range.start.line
        const column = range.start.character

        await this.gotoPositionInUri(uri, line, column, openType)
    }

    public async gotoPositionInUri(uri: string, line: number, column: number, openType: OpenType = OpenType.NewTab): Promise<void> {
        const filePath = Helpers.unwrapFileUriPath(uri)

        const activeEditor = this._editor
        const command = this._getCommandFromOpenType(openType)

        await activeEditor.neovim.command(`${command} ${filePath}`)
        await activeEditor.neovim.command(`cal cursor(${line + 1}, ${column + 1})`)
        await activeEditor.neovim.command("norm zz")
    }

    private _getCommandFromOpenType(openType: OpenType) {
        switch (openType) {
            case OpenType.SplitVertical:
                return "vsp"
            case OpenType.SplitHorizontal:
                return "sp"
            default:
                return "e"
        }
    }
}
