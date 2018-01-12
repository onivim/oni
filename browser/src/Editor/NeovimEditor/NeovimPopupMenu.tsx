/**
 * NeovimPopupMenu.tsx
 *
 * Implementation of Neovim's popup menu
 */

import * as React from "react"

import * as Oni from "oni-api"
import { IEvent } from "oni-types"

import { INeovimCompletionInfo, INeovimCompletionItem } from "./../../neovim"
import { IColors } from "./../../Services/Colors"
import { ContextMenuView, IContextMenuItem } from "./../../Services/ContextMenu"

import { IToolTipsProvider } from "./ToolTipsProvider"

const mapNeovimCompletionItemToContextMenuItem = (item: INeovimCompletionItem, idx: number, totalLength: number): IContextMenuItem  => ({
    label: item.word,
    detail: item.menu,
    documentation: (idx + 1).toString() + " of " + totalLength.toString(),
    icon: "align-right",
})

export class NeovimPopupMenu {

    private _lastItems: IContextMenuItem[] = []

    constructor(
        private _popupMenuShowEvent: IEvent<INeovimCompletionInfo>,
        private _popupMenuHideEvent: IEvent<void>,
        private _popupMenuSelectEvent: IEvent<number>,
        private _onBufferEnterEvent: IEvent<Oni.EditorBufferEventArgs>,
        private _colors: IColors,
        private _toolTipsProvider: IToolTipsProvider,
    ) {

        this._popupMenuShowEvent.subscribe((completionInfo) => {
            this._lastItems = completionInfo.items.map((i, idx) => mapNeovimCompletionItemToContextMenuItem(i, idx, completionInfo.items.length))

            this._renderCompletionMenu(completionInfo.selectedIndex)
        })

        this._popupMenuSelectEvent.subscribe((idx) => {
            this._renderCompletionMenu(idx)
        })

        this._popupMenuHideEvent.subscribe(() => {
            this._toolTipsProvider.hideToolTip("nvim-popup")
        })

        this._onBufferEnterEvent.subscribe(() => {
            this._toolTipsProvider.hideToolTip("nvim-popup")
        })
    }

    public dispose(): void {
        // TODO: Implement 'unsubscribe' logic here
        // tslint:disable-line
    }

    private _renderCompletionMenu(selectedIndex: number): void {

        let itemsToRender: IContextMenuItem[] = []
        let adjustedIndex = selectedIndex

        if  (selectedIndex < 10) {
            itemsToRender = this._lastItems.slice(0, 10)
        } else {
            itemsToRender = this._lastItems.slice(selectedIndex - 9, selectedIndex + 1)
            adjustedIndex = itemsToRender.length - 1
        }

        const highlightColor = this._colors.getColor("contextMenu.highlight")

        const completionElement = (
            <ContextMenuView
                visible={true}
                base={""}
                entries={itemsToRender}
                selectedIndex={adjustedIndex}
                backgroundColor={"black"}
                borderColor={"black"}
                highlightColor={highlightColor}
                foregroundColor={"white"} />
        )

        this._toolTipsProvider.showToolTip("nvim-popup", completionElement, {
                position: null,
                openDirection: 2,
                padding: "0px",
            })
    }
}
