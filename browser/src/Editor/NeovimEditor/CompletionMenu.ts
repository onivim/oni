/**
 * CompletionMenu.ts
 *
 * This is the completion menu that integrates with the completion providers
 * (which is primarily language server right now)
 * It's really just glue between the ContextMenu and Completion store.
 */

import * as types from "vscode-languageserver-types"

import { Event, IEvent } from "oni-types"

import { getDocumentationText } from "../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { ContextMenu } from "./../../Services/ContextMenu"

import * as CompletionUtility from "./../../Services/Completion/CompletionUtility"

export class CompletionMenu {
    private _onItemFocusedEvent: Event<types.CompletionItem> = new Event<types.CompletionItem>()
    private _onItemSelectedEvent: Event<types.CompletionItem> = new Event<types.CompletionItem>()

    public get onItemFocused(): IEvent<types.CompletionItem> {
        return this._onItemFocusedEvent
    }

    public get onItemSelected(): IEvent<types.CompletionItem> {
        return this._onItemSelectedEvent
    }

    constructor(private _contextMenu: ContextMenu) {
        this._contextMenu.onSelectedItemChanged.subscribe(item =>
            this._onItemFocusedEvent.dispatch(item.rawCompletion),
        )
        this._contextMenu.onItemSelected.subscribe(item =>
            this._onItemSelectedEvent.dispatch(item.rawCompletion),
        )
    }

    public show(options: types.CompletionItem[], filterText: string): void {
        const menuOptions = options.map(_convertCompletionForContextMenu)

        if (this._contextMenu.isOpen()) {
            this._contextMenu.setItems(menuOptions)
            this._contextMenu.setFilter(filterText)
        } else {
            this._contextMenu.show(menuOptions, filterText)
        }
    }

    public hide(): void {
        this._contextMenu.hide()
    }
}

// TODO: Should this be moved to another level? Like over to the menu renderer?
// It'd be nice if this layer only cared about `types.CompletionItem` and didn't
// have to worry about presentational aspects..
const _convertCompletionForContextMenu = (completion: types.CompletionItem): any => ({
    label: completion.label,
    detail: completion.detail,
    documentation: getCompletionDocumentation(completion),
    icon: CompletionUtility.convertKindToIconName(completion.kind),
    rawCompletion: completion,
})

const getCompletionDocumentation = (item: types.CompletionItem): string | null => {
    if (item.documentation) {
        return getDocumentationText(item.documentation)
    } else if (item.data && item.data.documentation) {
        return item.data.documentation
    } else {
        return null
    }
}
