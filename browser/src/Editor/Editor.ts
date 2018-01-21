/**
 * Interface that describes an Editor -
 * an editor handles rendering and input
 * for a specific window.
 */

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

// Potential API methods to augment the Oni API
export interface IEditor extends Oni.Editor {

    // Properties
    onCursorMoved: IEvent<Oni.Cursor>
    onSelectionChanged: IEvent<types.Range>

    // Methods
    init(filesToOpen: string[]): void
    render(): JSX.Element
}

/**
 * Base class for Editor implementations
 */
export class Editor implements Oni.Editor {
    private _currentMode: string
    private _onBufferEnterEvent = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferLeaveEvent = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferChangedEvent = new Event<Oni.EditorBufferChangedEventArgs>()
    private _onBufferSavedEvent = new Event<Oni.EditorBufferEventArgs>()
    private _onBufferScrolledEvent = new Event<Oni.EditorBufferScrolledEventArgs>()
    private _onCursorMoved = new Event<Oni.Cursor>()
    private _onModeChangedEvent = new Event<Oni.Vim.Mode>()
    private _onSelectionChangedEvent = new Event<types.Range>()

    public get mode(): string {
        return this._currentMode
    }

    public get activeBuffer(): Oni.Buffer {
        return null
    }

    public get onCursorMoved(): IEvent<Oni.Cursor> {
        return this._onCursorMoved
    }

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

    public get onSelectionChanged(): IEvent<types.Range> {
        return this._onSelectionChangedEvent
    }

    public /* virtual */ openFile(filePath: string): Promise<Oni.Buffer> {
        return Promise.reject("Not implemented")
    }

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

    protected notifySelectionChanged(newSelection: types.Range): void {
        this._onSelectionChangedEvent.dispatch(newSelection)
    }
}
