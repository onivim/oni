/**
 * NeovimPopupMenu.tsx
 *
 * Implementation of Neovim's popup menu
 */

import * as React from "react"

import * as types from "vscode-languageserver-types"

import { IEvent } from "./../Event"
import { INeovimCompletionInfo, INeovimCompletionItem } from "./../neovim"

import { editorManager } from "./../Services/EditorManager"

import * as Coordinates from "./../UI/Coordinates"

import * as UI from "./../UI"
import * as Selectors from "./../UI/Selectors"

import { ContextMenuView, IContextMenuItem } from "./../Services/ContextMenu"

const mapNeovimCompletionItemToContextMenuItem = (item: INeovimCompletionItem, idx: number, totalLength: number): IContextMenuItem  => ({
    label: item.word,
    detail: item.menu,
    documentation: (idx + 1).toString() + " of " + totalLength.toString(),
})

export class NeovimPopupMenu {

    private _lastItems: IContextMenuItem[] = []
    private _position: Coordinates.PixelSpacePoint

    constructor(
        private _popupMenuShowEvent: IEvent<INeovimCompletionInfo>,
        private _popupMenuHideEvent: IEvent<void>,
        private _popupMenuSelectEvent: IEvent<number>,
    ) {

        this._popupMenuShowEvent.subscribe((completionInfo) => {
            // In some cases, when the popup is being shown, there will be a distracting flicker.
            // This is due to the fact that the cursor moves to the command/message line
            // to show the "Match 1 of X" maessage.
            //
            // Since the `<CursorPositioner>` is based on the cursor position,
            // this can cause flickering as it flips down.
            //
            // To avoid this, we'll grab the current pixel position of the cursor,
            // and pin the completion menu there.j
            const store = UI.store.getState() as any
            const activeWindow = Selectors.getActiveWindow(store)
            const cursor = editorManager.activeEditor.activeBuffer.cursor
            const pos = types.Position.create(cursor.line, cursor.column)

            const screenSpace = activeWindow.bufferToScreen(pos)
            const pixelSpace = activeWindow.screenToPixel(screenSpace)

            this._position = pixelSpace
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
                position: this._position,
                openDirection: 2,
                padding: "0px",
            })
    }
}
