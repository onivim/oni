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

const CodeActionsAvailableToolTipId = "code-actions-available-tool-tip"

export class CodeActionRenderer {

    private _lastCommands: types.Command[] = null

    constructor(
        // private _colors: IColors,
        // private _editor: Oni.Editor,
        // private _configuration: Configuration,
        private _toolTipsProvider: IToolTipsProvider,
        private _contextMenu: ContextMenu,
    ) { }

    public hasCommands(): boolean {
        return this._lastCommands && this._lastCommands.length > 0
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

            const items = this._lastCommands.map(mapCommandsToItem)

            this._contextMenu.show(items)
            return true
        } else {
            return false
        }
    }

    public showCommands(commands: types.Command[]): void {
        this._lastCommands = commands

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
        this._toolTipsProvider.hideToolTip(CodeActionsAvailableToolTipId)
        this._contextMenu.hide()
    }

    private _renderQuickInfoElement(): JSX.Element {
        return <div className="icon-container">
            <Icon name="bolt" />
        </div>
    }
}
