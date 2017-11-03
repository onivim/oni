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

import * as types from "vscode-languageserver-types"

import { NeovimInstance } from "./index"

import * as Log from "./../Log"
import * as UI from "./../UI"
import * as Utility from "./../Utility"

export class NeovimWindowManager {

    private _scrollObservable: Subject<Oni.EventContext>

    constructor(
        private _neovimInstance: NeovimInstance,
    ) {

        this._scrollObservable = new Subject<Oni.EventContext>()

        const updateScroll = (evt: Oni.EventContext) => this._scrollObservable.next(evt)

        this._neovimInstance.autoCommands.onBufEnter.subscribe(updateScroll)
        this._neovimInstance.autoCommands.onBufWinEnter.subscribe(updateScroll)
        this._neovimInstance.onBufferUpdate.subscribe((buf) => updateScroll(buf.context))
        this._neovimInstance.autoCommands.onWinEnter.subscribe(updateScroll)
        this._neovimInstance.autoCommands.onCursorMoved.subscribe(updateScroll)
        this._neovimInstance.autoCommands.onVimResized.subscribe(updateScroll)
        this._neovimInstance.onScroll.subscribe(updateScroll)

        const shouldMeasure$: Observable<void> = this._scrollObservable
            .auditTime(25)
            .map((evt: Oni.EventContext) => ({
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
            .subscribe((args: [any, Oni.EventContext]) => {

                const [, evt] = args
                this._remeasureWindow(evt, false)
            })
    }

    public async remeasure(): Promise<void> {
        const newContext = await this._neovimInstance.getContext()
        this._scrollObservable.next(newContext)
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
    private async _remeasureWindow(context: Oni.EventContext, force: boolean = false): Promise<void> {
        const currentWin: any = await this._neovimInstance.request("nvim_get_current_win", [])

        const atomicCalls = [
            ["nvim_win_get_position", [currentWin.id]],
            ["nvim_win_get_width", [currentWin.id]],
            ["nvim_win_get_height", [currentWin.id]],
            ["nvim_buf_get_lines", [context.bufferNumber, context.windowTopLine - 1, context.windowBottomLine, false]],
        ]

        const response = await this._neovimInstance.request("nvim_call_atomic", [atomicCalls])

        const values = response[0]

        if (values.length === 4) {
            // Grab the results of the `nvim_atomic_call`, as they are returned in an array
            const position = values[0]
            const [row, col] = position
            const width = values[1]
            const height = values[2]
            const lines = values[3]

            // The 'gutterOffset' (difference between `wincol` and `column`) is the size of the gutter
            // (for example, line numbers). The buffer isn't in that space, so we need to account
            // for that.
            const offset = context.wincol - context.column

            // `contentWidth` is the number of cells the buffer is rendered itno
            const contentWidth = width - offset

            const rangesOnScreen = getBufferRanges(lines, context.windowTopLine - 1, contentWidth)

            const indexWhereCursorIs = rangesOnScreen.findIndex((val: types.Range) => Utility.isInRange(context.line - 1, context.column - 1, val))

            const arrayStart = indexWhereCursorIs - (context.winline - 1)
            const arrayEnd = arrayStart + height

            const ranges = rangesOnScreen.slice(arrayStart, arrayEnd)

            // If there is no text in the buffer, the range will be (line, 0) -> (line, 0).
            // This means we we wouldn't be able to map positions that don't exist yet,
            // so we should expand out the ranges to the full content width if they are less)
            const expandedWidthRanges = ranges.map((r) => {
                return types.Range.create(r.start.line, r.start.character, r.end.line, Math.max(r.end.character, contentWidth))
            })

            const dimensions = {
                x: col,
                y: row,
                width,
                height,
            }

            UI.Actions.setWindowState(
                    context.windowNumber,
                    context.bufferFullPath,
                    context.column - 1,
                    context.line - 1,
                    context.windowBottomLine - 1,
                    context.windowTopLine,
                    dimensions,
                    getBufferToScreenFromRanges(offset, expandedWidthRanges))

        } else {
            Log.warn("Measure request failed")
        }
    }
}

const getBufferToScreenFromRanges = (gutterOffset: number, ranges: types.Range[]) => (bufferPosition: types.Position) => {
    const screenLine = ranges.findIndex((v) => Utility.isInRange(bufferPosition.line, bufferPosition.character, v))

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
const getBufferRanges = (bufferLines: string[], startLine: number, width: number): types.Range[] => {

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
        const endPosition = types.Position.create(lineNumber, Math.min(bufferLine.length, i + width))
        const range = types.Range.create(startPosition, endPosition)
        chunks.push(range)
    }

    return chunks
}
