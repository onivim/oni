/**
 * Hover.tsx
 */

// import * as Oni from "oni-api"
import * as React from "react"

import * as types from "vscode-languageserver-types"

// import { IColors } from "./../../Services/Colors"
// import { Configuration } from "./../../Services/Configuration"
import { ContextMenu } from "./../../Services/ContextMenu"

import { IToolTipsProvider } from "./ToolTipsProvider"

import { Icon } from "./../../UI/Icon"

import { ICodeActionExecutor, CodeActionResult } from "./../../Services/Language"

import * as Log from "./../../Log"

const CodeActionsAvailableToolTipId = "code-actions-available-tool-tip"

export class CodeActionRenderer {

    private _codeActionResult: CodeActionResult

    constructor(
        // private _colors: IColors,
        // private _editor: Oni.Editor,
        // private _configuration: Configuration,
        private _codeActionExecutor: ICodeActionExecutor,
        private _toolTipsProvider: IToolTipsProvider,
        private _contextMenu: ContextMenu,
    ) { 
        this._contextMenu.onItemSelected.subscribe(async (selectedItem: types.CompletionItem) => {
            if (this.hasCommands()) {
                Log.info("[CodeActionRenderer] Executing command: " + selectedItem.data)
                this._codeActionExecutor.executeCodeAction(this._codeActionResult.language, this._codeActionResult.filePath, selectedItem.data)
            }
        })
    }

    public hasCommands(): boolean {
        return this._codeActionResult && this._codeActionResult.result && this._codeActionResult.result.commands && this._codeActionResult.result.commands.length > 0
    }

    public expandCommands(): boolean {
        if (this.hasCommands()) {
            this._toolTipsProvider.hideToolTip(CodeActionsAvailableToolTipId)
            const mapCommandsToItem = (command: types.Command, idx: number) => ({
                label: command.title,
                icon: "lightbulb-o",
                data: command.command,
                documentation: "Press enter to apply action.",
            })

            const items = this._codeActionResult.result.commands.map(mapCommandsToItem)

            this._contextMenu.show(items)
            return true
        } else {
            return false
        }
    }

    public showCommands(codeActionResult: CodeActionResult): void {

        if (!codeActionResult || !codeActionResult.result || !codeActionResult.result.commands || !codeActionResult.result.commands.length) {
            return
        }

        this._codeActionResult = codeActionResult

        const elem = this._renderQuickInfoElement()

        if (!elem) {
            return
        }

        this._toolTipsProvider.showToolTip(CodeActionsAvailableToolTipId, elem, {
            position: null,
            openDirection: 1,
        })
    }

    public hideCommands(): void {
        this._codeActionResult = null
        this._toolTipsProvider.hideToolTip(CodeActionsAvailableToolTipId)
        this._contextMenu.hide()
    }

    private _renderQuickInfoElement(): JSX.Element {
        return <div className="icon-container">
            <Icon name="bolt" />
        </div>
    }
}
