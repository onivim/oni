/**
 * NeovimWindowManager.ts
 *
 * Responsible for synchronizing the UI coordinate system / state
 * with the current state of the neovim instance.
 */

import { Observable } from "rxjs/Observable"
import { Subject } from "rxjs/Subject"

import "rxjs/add/operator/distinctUntilChanged"

import * as isEqual from "lodash/isEqual"

import * as Oni from "oni-api"
import * as Log from "oni-core-logging"
import { Event, IEvent } from "oni-types"

import * as types from "vscode-languageserver-types"

import { EventContext } from "./EventContext"
import { NeovimInstance } from "./index"

import * as Utility from "./../Utility"

interface NeovimWindow {
    id: number
}

export interface NeovimTabPageState {
    tabId: number
    activeWindow: NeovimActiveWindowState
    inactiveWindows: NeovimInactiveWindowState[]
}

export interface NeovimActiveWindowState {
    windowNumber: number
    bufferId: number
    bufferFullPath: string

    line: number
    column: number

    topBufferLine: number
    bottomBufferLine: number

    visibleLines: string[]

    bufferToScreen: Oni.Coordinates.BufferToScreen
    dimensions: Oni.Shapes.Rectangle
}

type Lines = string[]
type Height = number
type Width = number
type WindowPosition = [number, number]

export interface NeovimInactiveWindowState {
    windowNumber: number
    dimensions: Oni.Shapes.Rectangle
}

export class NeovimWindowManager extends Utility.Disposable {
    private _scrollObservable: Subject<EventContext>

    private _onWindowStateChangedEvent = new Event<NeovimTabPageState>()

    public get onWindowStateChanged(): IEvent<NeovimTabPageState> {
        return this._onWindowStateChangedEvent
    }

    constructor(private _neovimInstance: NeovimInstance) {
        super()

        this._scrollObservable = new Subject<EventContext>()

        const updateScroll = (evt: EventContext) => this._scrollObservable.next(evt)
        // First element of the BufEnter event is the current buffer
        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufEnter.subscribe(bufs =>
                updateScroll(bufs.current),
            ),
        )
        this.trackDisposable(
            this._neovimInstance.autoCommands.onBufWinEnter.subscribe(bufs =>
                updateScroll(bufs.current),
            ),
        )
        this.trackDisposable(
            this._neovimInstance.onBufferUpdate.subscribe(buf => updateScroll(buf.eventContext)),
        )
        this.trackDisposable(this._neovimInstance.autoCommands.onWinEnter.subscribe(updateScroll))
        this.trackDisposable(
            this._neovimInstance.autoCommands.onCursorMoved.subscribe(updateScroll),
        )
        this.trackDisposable(this._neovimInstance.autoCommands.onVimResized.subscribe(updateScroll))
        this.trackDisposable(this._neovimInstance.onScroll.subscribe(updateScroll))

        const shouldMeasure$: Observable<void> = this._scrollObservable
            .map((evt: EventContext) => ({
                version: evt.version,
                bufferTotalLines: evt.bufferTotalLines,
                windowNumber: evt.windowNumber,
                windowTopLine: evt.windowTopLine,
                windowBottomLine: evt.windowBottomLine,
                windowWidth: evt.windowWidth,
                windowHeight: evt.windowHeight,
            }))
            .distinctUntilChanged(isEqual)

        shouldMeasure$
            .withLatestFrom(this._scrollObservable)
            .switchMap(([, evt]: [any, EventContext]) =>
                Observable.defer(() => this._remeasure(evt)),
            )
            .subscribe((tabState: NeovimTabPageState) => {
                if (tabState) {
                    this._onWindowStateChangedEvent.dispatch(tabState)
                }
            })
    }

    public async remeasure(): Promise<void> {
        if (this.isDisposed) {
            return
        }

        const newContext = await this._neovimInstance.getContext()
        this._scrollObservable.next(newContext)
    }

    private async _remeasure(context: EventContext): Promise<NeovimTabPageState> {
        const tabNumber = context.tabNumber
        const allWindows = await this._neovimInstance.request<NeovimWindow[]>(
            "nvim_tabpage_list_wins",
            [tabNumber],
        )

        const activeWindow = await this._remeasureActiveWindow(context.windowNumber, context)

        if (!activeWindow) {
            return null
        }

        const inactiveWindowIds = allWindows.filter(w => w.id !== context.windowNumber)

        const inactiveWindows = await Promise.all(
            inactiveWindowIds.map(window => this._remeasureInactiveWindow(window.id)),
        )

        return {
            tabId: tabNumber,
            activeWindow,
            inactiveWindows,
        }
    }

    // The goal of this function is to acquire functions for the current window:
    // - bufferSpaceToScreenSpace(range) => Range[]
    // - bufferSpaceToPixelSpace(range) => Rectangle[]
    //
    // These are needed for rich-UI rendering (knowing where adorners and elements should be rendered,
    // relative to text in the document). An example is the error squiggle - we need to translate the
    // error range into pixel-range.
    //
    // To get those, we need some information:
    // - The dimensions of the window itself
    // - How each buffer line maps to the screen space
    //
    // We can derive these from information coming from the event handlers, along with screen width
    private async _remeasureActiveWindow(
        currentWinId: number,
        context: EventContext,
    ): Promise<NeovimActiveWindowState> {
        // We query the top and bottom line positions again despite these being on the context
        // as the values from the `BufferUpdate` event can be incorrect
        const [topLine, bottomLine] = await Promise.all([
            this._neovimInstance.callFunction("line", ["w0"]),
            this._neovimInstance.callFunction("line", ["w$"]),
        ])
        const atomicCalls = [
            ["nvim_win_get_position", [currentWinId]],
            ["nvim_win_get_width", [currentWinId]],
            ["nvim_win_get_height", [currentWinId]],
            ["nvim_buf_get_lines", [context.bufferNumber, topLine - 1, bottomLine, false]],
        ]

        const response = await this._neovimInstance.request<
            Array<[WindowPosition, Width, Height, Lines]>
        >("nvim_call_atomic", [atomicCalls])

        if (!response) {
            return null
        }

        const [values] = response

        if (values.length === 4) {
            // Grab the results of the `nvim_atomic_call`, as they are returned in an array
            const [position, width, height, lines] = values
            const [row, col] = position

            // The 'gutterOffset' (difference between `wincol` and `column`) is the size of the gutter
            // (for example, line numbers). The buffer isn't in that space, so we need to account
            // for that.
            const offset = context.wincol - context.column

            // `contentWidth` is the number of cells the buffer is rendered itno
            const contentWidth = width - offset

            const rangesOnScreen = getBufferRanges(lines, context.windowTopLine - 1, contentWidth)

            const indexWhereCursorIs = rangesOnScreen.findIndex((val: types.Range) =>
                Utility.isInRange(context.line - 1, context.column - 1, val),
            )

            const arrayStart = indexWhereCursorIs - (context.winline - 1)
            const arrayEnd = arrayStart + height

            const ranges = rangesOnScreen.slice(arrayStart, arrayEnd)

            // If there is no text in the buffer, the range will be (line, 0) -> (line, 0).
            // This means we we wouldn't be able to map positions that don't exist yet,
            // so we should expand out the ranges to the full content width if they are less)
            const expandedWidthRanges = ranges.map(r => {
                return types.Range.create(
                    r.start.line,
                    r.start.character,
                    r.end.line,
                    Math.max(r.end.character, contentWidth),
                )
            })

            const dimensions = {
                x: col,
                y: row,
                width,
                height,
            }

            const newWindowState = {
                windowNumber: currentWinId,
                bufferId: context.bufferNumber,
                bufferFullPath: context.bufferFullPath,
                column: context.column - 1,
                line: context.line - 1,
                bottomBufferLine: context.windowBottomLine - 1,
                topBufferLine: context.windowTopLine,
                dimensions,
                visibleLines: lines || [],
                bufferToScreen: getBufferToScreenFromRanges(offset, expandedWidthRanges),
            }

            return newWindowState
        } else {
            Log.warn("Measure request failed")
            return null
        }
    }

    /**
     * Windows that are inactive give us less state, unfortunately - so the buffer/pixel mapping
     * is unavailable. We should still measure the width/height/position for overlay scenarios, though
     */
    private async _remeasureInactiveWindow(
        currentWinId: number,
    ): Promise<NeovimInactiveWindowState> {
        const atomicCalls = [
            ["nvim_win_get_position", [currentWinId]],
            ["nvim_win_get_width", [currentWinId]],
            ["nvim_win_get_height", [currentWinId]],
        ]

        const response = await this._neovimInstance.request("nvim_call_atomic", [atomicCalls])

        const values = response[0]

        if (values.length === 3) {
            // Grab the results of the `nvim_atomic_call`, as they are returned in an array
            const [position, width, height] = values
            const [row, col] = position

            const dimensions = {
                x: col,
                y: row,
                width,
                height,
            }

            const newWindowState = {
                windowNumber: currentWinId,
                dimensions,
            }

            return newWindowState
        } else {
            Log.warn("Measure request failed")
            return null
        }
    }
}

const getBufferToScreenFromRanges = (gutterOffset: number, ranges: types.Range[]) => (
    bufferPosition: types.Position,
) => {
    const screenLine = ranges.findIndex(v =>
        Utility.isInRange(bufferPosition.line, bufferPosition.character, v),
    )

    if (screenLine === -1) {
        return null
    }

    const yPos = screenLine
    const range = ranges[screenLine]
    const xPos = gutterOffset + bufferPosition.character - range.start.character

    return {
        screenX: xPos,
        screenY: yPos,
    }
}

// TODO: Need to properly handle multibyte characters here
const getBufferRanges = (
    bufferLines: string[],
    startLine: number,
    width: number,
): types.Range[] => {
    let ranges: types.Range[] = []

    for (let i = 0; i < bufferLines.length; i++) {
        ranges = ranges.concat(getRangesForLine(bufferLines[i], startLine + i, width))
    }

    return ranges
}

const getRangesForLine = (bufferLine: string, lineNumber: number, width: number): types.Range[] => {
    if (!bufferLine || !bufferLine.length) {
        const startPosition = types.Position.create(lineNumber, 0)
        const endPosition = types.Position.create(lineNumber, 0)
        return [types.Range.create(startPosition, endPosition)]
    }

    const length = bufferLine.length
    const chunks: types.Range[] = []

    for (let i = 0; i < length; i += width) {
        const startPosition = types.Position.create(lineNumber, i)
        const endPosition = types.Position.create(
            lineNumber,
            Math.min(bufferLine.length, i + width),
        )
        const range = types.Range.create(startPosition, endPosition)
        chunks.push(range)
    }

    return chunks
}
