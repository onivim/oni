/**
 * LanguageEditorIntegration
 *
 * Responsible for listening to editor events,
 * and hooking up the language service functionality.
 */

import { Store, Unsubscribe } from "redux"

import * as Oni from "oni-api"
import * as OniTypes from "oni-types"

import * as types from "vscode-languageserver-types"

import { Configuration } from "./../Configuration"

import { LanguageManager } from "./LanguageManager"
import { createStore, DefaultLanguageState, ILanguageState } from "./LanguageStore"

import {
    IDefinitionRequestor,
    IDefinitionResult,
    LanguageServiceDefinitionRequestor,
} from "./DefinitionRequestor"
import { IHoverRequestor, IHoverResult, LanguageServiceHoverRequestor } from "./HoverRequestor"

export class LanguageEditorIntegration implements OniTypes.IDisposable {
    private _subscriptions: OniTypes.IDisposable[] = []
    private _store: Store<ILanguageState>
    private _storeUnsubscribe: Unsubscribe = null
    private _lastState: ILanguageState = DefaultLanguageState

    private _onShowDefinition: OniTypes.Event<IDefinitionResult> = new OniTypes.Event<
        IDefinitionResult
    >()
    private _onHideDefinition: OniTypes.Event<void> = new OniTypes.Event<void>()

    private _onShowHover: OniTypes.Event<IHoverResult> = new OniTypes.Event<IHoverResult>()
    private _onHideHover: OniTypes.Event<void> = new OniTypes.Event<void>()

    public get onShowDefinition(): OniTypes.IEvent<IDefinitionResult> {
        return this._onShowDefinition
    }
    public get onHideDefinition(): OniTypes.IEvent<void> {
        return this._onHideDefinition
    }

    public get onShowHover(): OniTypes.IEvent<IHoverResult> {
        return this._onShowHover
    }
    public get onHideHover(): OniTypes.IEvent<void> {
        return this._onHideHover
    }

    constructor(
        private _editor: Oni.Editor,
        private _configuration: Configuration,
        private _languageManager?: LanguageManager,
        private _definitionRequestor?: IDefinitionRequestor,
        private _hoverRequestor?: IHoverRequestor,
    ) {
        this._definitionRequestor =
            this._definitionRequestor ||
            new LanguageServiceDefinitionRequestor(this._languageManager, this._editor)
        this._hoverRequestor =
            this._hoverRequestor || new LanguageServiceHoverRequestor(this._languageManager)

        this._store = createStore(
            this._configuration,
            this._hoverRequestor,
            this._definitionRequestor,
        )

        this._subscriptions = [
            this._editor.onModeChanged.subscribe((newMode: string) => {
                this._store.dispatch({
                    type: "MODE_CHANGED",
                    mode: newMode,
                })
            }),

            this._editor.onBufferEnter.subscribe((bufferEvent: Oni.EditorBufferEventArgs) => {
                this._store.dispatch({
                    type: "BUFFER_ENTER",
                    filePath: bufferEvent.filePath,
                    language: bufferEvent.language,
                })
            }),
            this._editor.onCursorMoved.subscribe((cursorMoveEvent: Oni.Cursor) => {
                this._store.dispatch({
                    type: "CURSOR_MOVED",
                    line: cursorMoveEvent.line,
                    column: cursorMoveEvent.column,
                })
            }),
            this._editor.onBufferScrolled.subscribe(scrollEvent => {
                this._onHideHover.dispatch()
                this._onHideDefinition.dispatch()
            }),
        ]

        this._storeUnsubscribe = this._store.subscribe(() =>
            this._onStateUpdate(this._store.getState()),
        )
    }

    // Explicit gesture to show hover - ignores the setting
    public showHover(): void {
        const state = this._store.getState()
        this._store.dispatch({
            type: "HOVER_QUERY",
            location: {
                filePath: state.activeBuffer.filePath,
                language: state.activeBuffer.language,
                line: state.cursor.line,
                column: state.cursor.column,
            },
        })
    }

    public dispose(): void {
        if (this._subscriptions && this._subscriptions.length) {
            this._subscriptions.forEach(disposable => disposable.dispose())
            this._subscriptions = null
        }

        if (this._storeUnsubscribe) {
            this._storeUnsubscribe()
            this._storeUnsubscribe = null
        }
    }

    private _onStateUpdate(newState: ILanguageState): void {
        const newLocationResult = getLocationFromState(newState)
        const lastLocationResult = getLocationFromState(this._lastState)
        if (newLocationResult && !lastLocationResult) {
            this._onShowDefinition.dispatch(newState.definitionResult.result)
        }

        if (!newLocationResult && lastLocationResult) {
            this._onHideDefinition.dispatch()
        }

        if (newState.hoverResult.result && !this._lastState.hoverResult.result) {
            this._onShowHover.dispatch(newState.hoverResult.result)
        }

        if (!newState.hoverResult.result && this._lastState.hoverResult.result) {
            this._onHideHover.dispatch()
        }

        this._lastState = newState
    }
}

const getLocationFromState = (state: ILanguageState): types.Location => {
    if (
        state &&
        state.definitionResult &&
        state.definitionResult.result &&
        state.definitionResult.result.location
    ) {
        return state.definitionResult.result.location
    } else {
        return null
    }
}
