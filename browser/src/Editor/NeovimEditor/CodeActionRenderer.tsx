/**
 * Hover.tsx
 */

// import * as Oni from "oni-api"
import * as React from "react"

// import { IColors } from "./../../Services/Colors"
// import { Configuration } from "./../../Services/Configuration"

import { IToolTipsProvider } from "./ToolTipsProvider"

import { Icon } from "./../../UI/Icon"

const CodeActionsAvailableToolTipId = "code-actions-available-tool-tip"

export class CodeActionRenderer {

    constructor(
        // private _colors: IColors,
        // private _editor: Oni.Editor,
        // private _configuration: Configuration,
        private _toolTipsProvider: IToolTipsProvider,
    ) { }

    public showCommands(): void {
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
    }

    private _renderQuickInfoElement(): JSX.Element {
        return <div className="icon-container">
            <Icon name="bolt" />
            </div>
    }
}
