/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import * as types from "vscode-languageserver-types"

import { Disposable } from "./../Utility"

/**
 * Base class for Editor implementations
 */
export abstract class Editor extends Disposable implements Oni.Editor {
    private _currentMode: string
    private _onBufferEnterEvent = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferLeaveEvent = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferChangedEvent = new Event<Oni.EditorBufferChangedEventArgs>()
    private _onBufferSavedEvent = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferScrolledEvent = new Event<Oni.EditorBufferScrolledEventArgs>()
    private _onCursorMoved = new Event<Oni.Cursor>()
    private _onModeChangedEvent = new Event<Oni.Vim.Mode>()

    public get mode(): string {
        return this._currentMode
    }

    public get activeBuffer(): Oni.Buffer {
        return null
    }

    public get onCursorMoved(): IEvent<Oni.Cursor> {
        return this._onCursorMoved
    }

    public abstract init(filesToOpen: string[]): void

    // Events

    public get onModeChanged(): IEvent<Oni.Vim.Mode> {
        return this._onModeChangedEvent
    }

    public get onBufferEnter(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferEnterEvent
    }

    public get onBufferLeave(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferLeaveEvent
    }

    public get onBufferChanged(): IEvent<Oni.EditorBufferChangedEventArgs> {
        return this._onBufferChangedEvent
    }

    public get onBufferSaved(): IEvent<Oni.EditorBufferEventArgs> {
        return this._onBufferSavedEvent
    }

    public get onBufferScrolled(): IEvent<Oni.EditorBufferScrolledEventArgs> {
        return this._onBufferScrolledEvent
    }

    public getBuffers(): Array<Oni.Buffer | Oni.InactiveBuffer> {
        return []
    }

    public /* virtual */ openFile(
        filePath: string,
        openOptions: Oni.FileOpenOptions = Oni.DefaultFileOpenOptions,
    ): Promise<Oni.Buffer> {
        return Promise.reject("Not implemented")
    }

    public async blockInput(
        inputFunction: (input: Oni.InputCallbackFunction) => Promise<void>,
    ): Promise<void> {
        return Promise.reject("Not implemented")
    }

    public setTextOptions(options: Oni.EditorTextOptions): Promise<void> {
        return Promise.reject("Not implemented")
    }

    public abstract render(): JSX.Element

    public abstract setSelection(selectionRange: types.Range): Promise<void>

    protected setMode(mode: Oni.Vim.Mode): void {
        if (mode !== this._currentMode) {
            this._currentMode = mode
            this._onModeChangedEvent.dispatch(mode)
        }
    }

    protected notifyCursorMoved(cursor: Oni.Cursor): void {
        this._onCursorMoved.dispatch(cursor)
    }

    protected notifyBufferChanged(bufferChangeEvent: Oni.EditorBufferChangedEventArgs): void {
        this._onBufferChangedEvent.dispatch(bufferChangeEvent)
    }

    protected notifyBufferEnter(bufferEvent: Oni.EditorBufferEventArgs): void {
        this._onBufferEnterEvent.dispatch(bufferEvent)
    }

    protected notifyBufferLeave(bufferEvent: Oni.EditorBufferEventArgs): void {
        this._onBufferLeaveEvent.dispatch(bufferEvent)
    }

    protected notifyBufferSaved(bufferEvent: Oni.EditorBufferEventArgs): void {
        this._onBufferSavedEvent.dispatch(bufferEvent)
    }

    protected notifyBufferScrolled(bufferScrollEvent: Oni.EditorBufferScrolledEventArgs): void {
        this._onBufferScrolledEvent.dispatch(bufferScrollEvent)
    }
}
