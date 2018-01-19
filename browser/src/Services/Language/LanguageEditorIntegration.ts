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

import { IEditor } from "./../../Editor/Editor"

import { createStore, DefaultLanguageState, ILanguageState } from "./LanguageStore"

import { ICodeActionRequestor, ICodeActionResult } from "./CodeActionsRequestor"
import { IDefinitionRequestor, IDefinitionResult } from "./DefinitionRequestor"
import { IHoverRequestor, IHoverResult } from "./HoverRequestor"

export class LanguageEditorIntegration implements OniTypes.IDisposable {

    private _subscriptions: OniTypes.IDisposable[] = []
    private _store: Store<ILanguageState>
    private _storeUnsubscribe: Unsubscribe = null
    private _lastState: ILanguageState = DefaultLanguageState

    private _onShowDefinition: OniTypes.Event<IDefinitionResult> = new OniTypes.Event<IDefinitionResult>()
    private _onHideDefinition: OniTypes.Event<void> = new OniTypes.Event<void>()

    private _onShowHover: OniTypes.Event<IHoverResult> = new OniTypes.Event<IHoverResult>()
    private _onHideHover: OniTypes.Event<void> = new OniTypes.Event<void>()

    private _onShowCodeActions = new OniTypes.Event<ICodeActionResult>()
    private _onHideCodeActions = new OniTypes.Event<void>()

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

    public get onShowCodeActions(): OniTypes.IEvent<ICodeActionResult> {
        return this._onShowCodeActions
    }
    public get onHideCodeActions(): OniTypes.IEvent<void> {
        return this._onHideCodeActions
    }

    constructor(
        private _editor: IEditor,
        private _configuration: Configuration,
        private _codeActionRequestor: ICodeActionRequestor,
        private _definitionRequestor: IDefinitionRequestor,
        private _hoverRequestor: IHoverRequestor,
    ) {

        this._store = createStore(this._configuration, this._codeActionRequestor, this._hoverRequestor, this._definitionRequestor)

        const sub1 = this._editor.onModeChanged.subscribe((newMode: string) => {
            this._store.dispatch({
                type: "MODE_CHANGED",
                mode: newMode,
            })
        })

        const sub2 = this._editor.onBufferEnter.subscribe((bufferEvent: Oni.EditorBufferEventArgs) => {
            this._store.dispatch({
                type: "BUFFER_ENTER",
                filePath: bufferEvent.filePath,
                language: bufferEvent.language,
            })
        })

        // TODO: Promote cursor moved to API
        const sub3 = this._editor.onCursorMoved.subscribe((cursorMoveEvent: Oni.Cursor) => {
            this._store.dispatch({
                type: "CURSOR_MOVED",
                line: cursorMoveEvent.line,
                column: cursorMoveEvent.column,
            })
        })

        const sub4 = this._editor.onSelectionChanged.subscribe((newRange: types.Range) => {
            this._store.dispatch({
                type: "SELECTION_CHANGED",
                range: newRange,
            })
        })

        this._storeUnsubscribe = this._store.subscribe(() => this._onStateUpdate(this._store.getState()))

        this._subscriptions = [sub1, sub2, sub3, sub4]
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
            this._subscriptions.forEach((disposable) => disposable.dispose())
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

        if (newState.codeActionResult.result && !this._lastState.codeActionResult.result) {
            this._onShowCodeActions.dispatch(newState.codeActionResult.result)
        }

        if (!newState.codeActionResult.result && this._lastState.codeActionResult.result) {
            this._onHideCodeActions.dispatch()
        }

        this._lastState = newState
    }
}

const getLocationFromState = (state: ILanguageState): types.Location => {
    if (state && state.definitionResult && state.definitionResult.result && state.definitionResult.result.location) {
        return state.definitionResult.result.location
    } else {
        return null
    }
}
