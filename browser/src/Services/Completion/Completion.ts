/**
 * Completion.ts
 */

import * as Oni from "oni-api"
import { Event, IDisposable, IEvent } from "oni-types"
import { Store, Unsubscribe } from "redux"
import * as types from "vscode-languageserver-types"

import { LanguageManager } from "./../Language"
import { SnippetManager } from "./../Snippets"

import { getFilteredCompletions } from "./CompletionSelectors"
import { ICompletionsRequestor } from "./CompletionsRequestor"

import { ICompletionState } from "./CompletionState"

import { createStore } from "./CompletionStore"

import { Configuration } from "./../Configuration"

export interface ICompletionShowEventArgs {
    filteredCompletions: types.CompletionItem[]
    base: string
}

export class Completion implements IDisposable {
    private _lastCursorPosition: Oni.Cursor
    private _store: Store<ICompletionState>
    private _storeUnsubscribe: Unsubscribe = null
    private _subscriptions: IDisposable[]

    private _onShowCompletionItemsEvent: Event<ICompletionShowEventArgs> = new Event<
        ICompletionShowEventArgs
    >()
    private _onHideCompletionItemsEvent: Event<void> = new Event<void>()

    public get onShowCompletionItems(): IEvent<ICompletionShowEventArgs> {
        return this._onShowCompletionItemsEvent
    }

    public get onHideCompletionItems(): IEvent<void> {
        return this._onHideCompletionItemsEvent
    }

    constructor(
        private _editor: Oni.Editor,
        private _configuration: Configuration,
        private _completionsRequestor: ICompletionsRequestor,
        private _languageManager: LanguageManager,
        private _snippetManager: SnippetManager,
    ) {
        this._completionsRequestor = this._completionsRequestor
        this._store = createStore(
            this._editor,
            this._languageManager,
            this._configuration,
            this._completionsRequestor,
            this._snippetManager,
        )

        const sub1 = this._editor.onBufferEnter.subscribe((buf: Oni.Buffer) => {
            this._onBufferEnter(buf)
        })

        const sub2 = this._editor.onBufferChanged.subscribe(
            (buf: Oni.EditorBufferChangedEventArgs) => {
                this._onBufferUpdate(buf)
            },
        )

        const sub3 = this._editor.onModeChanged.subscribe((newMode: string) => {
            this._onModeChanged(newMode)
        })

        const sub4 = this._editor.onCursorMoved.subscribe((cursor: Oni.Cursor) => {
            this._onCursorMoved(cursor)
        })

        this._subscriptions = [sub1, sub2, sub3, sub4]
        this._storeUnsubscribe = this._store.subscribe(() =>
            this._onStateChanged(this._store.getState()),
        )
    }

    public resolveItem(completionItem: types.CompletionItem): void {
        this._store.dispatch({
            type: "GET_COMPLETION_ITEM_DETAILS",
            completionItem,
        })
    }

    public commitItem(completionItem: types.CompletionItem): void {
        const state = this._store.getState()
        this._store.dispatch({
            type: "COMMIT_COMPLETION",
            meetLine: state.meetInfo.meetLine,
            meetPosition: state.meetInfo.meetPosition,
            completion: completionItem,
        })
    }

    public dispose(): void {
        if (this._subscriptions) {
            this._subscriptions.forEach(disposable => disposable.dispose())
            this._subscriptions = null
        }

        if (this._storeUnsubscribe) {
            this._storeUnsubscribe()
            this._storeUnsubscribe = null
        }
    }

    private _onStateChanged(newState: ICompletionState): void {
        const filteredCompletions = getFilteredCompletions(newState)

        if (filteredCompletions && filteredCompletions.length) {
            this._onShowCompletionItemsEvent.dispatch({
                filteredCompletions,
                base: newState.meetInfo.meetBase,
            })
        } else {
            this._onHideCompletionItemsEvent.dispatch()
        }
    }

    private _onCursorMoved(cursor: Oni.Cursor): void {
        this._lastCursorPosition = cursor
    }

    private _onBufferEnter(buffer: Oni.Buffer): void {
        this._store.dispatch({
            type: "BUFFER_ENTER",
            language: buffer.language,
            filePath: buffer.filePath,
        })
    }

    private _onBufferUpdate(bufferUpdate: Oni.EditorBufferChangedEventArgs): void {
        // Ignore if this is a full update
        const firstChange = bufferUpdate.contentChanges[0]

        if (!firstChange || !firstChange.range) {
            return
        }

        const range = firstChange.range

        // We only work with single line changes, for now.
        // Perhaps we could get the latest line by querying the activeBuffer
        // from cursorMoved, but right now, the update comes _after_
        // the cursorMoved event - so this is the most reliable way.
        if (range.start.line + 1 !== range.end.line) {
            return
        }

        const newLine = firstChange.text

        if (this._lastCursorPosition && range.start.line === this._lastCursorPosition.line) {
            this._store.dispatch({
                type: "CURSOR_MOVED",
                line: this._lastCursorPosition.line,
                column: this._lastCursorPosition.column,
                lineContents: newLine,
            })
        }
    }

    private async _onModeChanged(newMode: string): Promise<void> {
        if (newMode === "insert" && this._lastCursorPosition) {
            const [latestLine] = await this._editor.activeBuffer.getLines(
                this._lastCursorPosition.line,
                this._lastCursorPosition.line + 1,
            )

            this._store.dispatch({
                type: "CURSOR_MOVED",
                line: this._lastCursorPosition.line,
                column: this._lastCursorPosition.column,
                lineContents: latestLine,
            })
        }

        this._store.dispatch({
            type: "MODE_CHANGED",
            mode: newMode,
        })
    }
}
