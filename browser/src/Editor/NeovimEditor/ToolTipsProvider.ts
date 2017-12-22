import * as Oni from "oni-api"

import * as Actions from "./NeovimEditorActions"

export interface IToolTipsProvider {
    showToolTip(id: string, element: JSX.Element, options: Oni.ToolTip.ToolTipOptions): void
    hideToolTip(id: string): void
}

export class NeovimEditorToolTipsProvider implements IToolTipsProvider {
    constructor(
        private _actions: typeof Actions,
    ) { }

    public showToolTip(id: string, element: JSX.Element, options: Oni.ToolTip.ToolTipOptions): void {
        this._actions.showToolTip(id, element, options)
    }

    public hideToolTip(id: string): void {
        this._actions.hideToolTip(id)
    }
}
