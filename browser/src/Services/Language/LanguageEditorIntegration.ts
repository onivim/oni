/**
 * LanguageEditorIntegration
 *
 * Responsible for listening to editor events,
 * and hooking up the language service functionality.
 */

import "rxjs/add/observable/never"
import { Observable } from "rxjs/Observable"

import { Store, Unsubscribe } from "redux"

import * as Oni from "oni-api"
import * as OniTypes from "oni-types"

import { Configuration } from "./../Configuration"

import { editorManager } from "./../EditorManager"
import * as SignatureHelp from "./SignatureHelp"

import { createStore, DefaultLanguageState, ILanguageState } from "./LanguageStore"

import { languageManager } from "./LanguageManager"

import { IDefinitionResult, LanguageServiceDefinitionRequestor } from "./DefinitionRequestor"
import { IHoverResult, LanguageServiceHoverRequestor } from "./HoverRequestor"

export class LanguageEditorIntegration implements OniTypes.IDisposable {

    private _subscriptions: OniTypes.IDisposable[] = []
    private _store: Store<ILanguageState>
    private _storeUnsubscribe: Unsubscribe = null
    private _lastState: ILanguageState = DefaultLanguageState

    private _onShowDefinition: OniTypes.Event<IDefinitionResult> = new OniTypes.Event<IDefinitionResult>()
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
    ) {

        const hoverDelayFunction = () => this._configuration.getValue("editor.quickInfo.delay")

        const definitionRequestor = new LanguageServiceDefinitionRequestor(languageManager, this._editor)
        const hoverRequestor = new LanguageServiceHoverRequestor(languageManager, this._configuration)

        this._store = createStore(hoverDelayFunction, hoverRequestor, definitionRequestor)

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
        const sub3 = (this._editor as any).onCursorMoved.subscribe((cursorMoveEvent: Oni.Cursor) => {
            this._store.dispatch({
                type: "CURSOR_MOVED",
                line: cursorMoveEvent.line,
                column: cursorMoveEvent.column,
            })
        })

        this._storeUnsubscribe = this._store.subscribe(() => this._onStateUpdate(this._store.getState()))

        this._subscriptions = [sub1, sub2, sub3]
    }

    private _onStateUpdate(newState: ILanguageState): void {

        if (newState.definitionResult.result && !this._lastState.definitionResult.result) {
            // TODO: Check that cursor position matches
            this._onShowDefinition.dispatch(newState.definitionResult.result)
        }

        if (!newState.definitionResult.result && this._lastState.definitionResult.result) {
            this._onHideDefinition.dispatch()
        }

        if (newState.hoverResult.result && !this._lastState.hoverResult.result) {
            // TODO: Check that cursor position matches
            this._onShowHover.dispatch(newState.hoverResult.result)
        }

        if (!newState.hoverResult.result && this._lastState.hoverResult.result) {
            this._onHideHover.dispatch()
        }

        this._lastState = newState
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
}

export interface ILatestCursorAndBufferInfo {
    filePath: string,
    language: string,
    cursorLine: number,
    contents: string,
    cursorColumn: number,
}

export const addInsertModeLanguageFunctionality = (cursorMoved$: Observable<Oni.Cursor>, modeChanged$: Observable<Oni.Vim.Mode>) => {

    const latestCursorAndBufferInfo$: Observable<ILatestCursorAndBufferInfo> = cursorMoved$
            .auditTime(10)
            .mergeMap(async (cursorPos) => {
                const editor = editorManager.activeEditor
                const buffer = editor.activeBuffer

                const changedLines: string[] = await buffer.getLines(cursorPos.line, cursorPos.line + 1)
                const changedLine = changedLines[0]
                return {
                    filePath: buffer.filePath,
                    language: buffer.language,
                    cursorLine: cursorPos.line,
                    contents: changedLine,
                    cursorColumn: cursorPos.column,
                }
            })

    SignatureHelp.initUI(latestCursorAndBufferInfo$, modeChanged$)
}
