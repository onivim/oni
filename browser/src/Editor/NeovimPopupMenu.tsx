/**
 * NeovimPopupMenu.tsx
 *
 * Implementation of Neovim's popup menu
 */

import * as React from "react"

import { IEvent } from "./../Event"
import { INeovimCompletionInfo, INeovimCompletionItem } from "./../neovim"

import * as UI from "./../UI"

import { ContextMenuView, IContextMenuItem } from "./../Services/ContextMenu"

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
    ) {

        this._popupMenuShowEvent.subscribe((completionInfo) => {
            this._lastItems = completionInfo.items.map((i, idx) => mapNeovimCompletionItemToContextMenuItem(i, idx, completionInfo.items.length))

            this._renderCompletionMenu(completionInfo.selectedIndex)
        })

        this._popupMenuSelectEvent.subscribe((idx) => {

            this._renderCompletionMenu(idx)
        })

        this._popupMenuHideEvent.subscribe(() => {
            UI.Actions.hideToolTip("nvim-popup")
        })
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

        const completionElement = <ContextMenuView visible={true} base={""} entries={itemsToRender} selectedIndex={adjustedIndex} backgroundColor={"black"} foregroundColor={"white"} />
        UI.Actions.showToolTip("nvim-popup", completionElement, {
                position: null,
                openDirection: 2,
                padding: "0px",
            })
    }
}
