/**
 * CompletionMenu.ts
 *
 * This is the completion menu that integrates with the completion providers
 * (which is primarily language server right now)
 * It's really just glue between the ContextMenu and Completion store.
 */

import * as types from "vscode-languageserver-types"

import { Event, IEvent } from "oni-types"

import { ContextMenu } from "./../../Services/ContextMenu"

export class CompletionMenu {
    private _onItemFocusedEvent: Event<types.CompletionItem> = new Event<types.CompletionItem>()
    private _onItemSelectedEvent: Event<types.CompletionItem> = new Event<types.CompletionItem>()

    public get onItemFocused(): IEvent<types.CompletionItem> {
        return this._onItemFocusedEvent
    }

    public get onItemSelected(): IEvent<types.CompletionItem> {
        return this._onItemSelectedEvent
    }

    constructor(
        private _contextMenu: ContextMenu,
    ) {
        this._contextMenu.onSelectedItemChanged.subscribe((item) => this._onItemFocusedEvent.dispatch(item))
        this._contextMenu.onItemSelected.subscribe((item) => this._onItemSelectedEvent.dispatch(item))
    }

    public show(options: types.CompletionItem[], filterText: string): void {
        if (this._contextMenu.isOpen()) {
            this._contextMenu.setItems(options)
            this._contextMenu.setFilter(filterText)
        } else {
            this._contextMenu.show(options, filterText)
        }
    }

    public hide(): void {
        this._contextMenu.hide()
    }

}
