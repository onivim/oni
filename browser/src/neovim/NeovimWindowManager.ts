import { IScreen } from "./../Screen"

import { /*IWindow,*/ NeovimInstance } from "./index"

// import { Rectangle } from "./../UI/Types"

export class NeovimWindowManager {

    constructor(
        private _screen: IScreen, 
        private _neovimInstance: NeovimInstance
    ) {
        this._neovimInstance.autoCommands.onBufEnter.subscribe((evt: Oni.EventContext) => this._remeasureWindow(evt))
        this._neovimInstance.autoCommands.onBufWinEnter.subscribe((evt: Oni.EventContext) => this._remeasureWindow(evt))
        this._neovimInstance.autoCommands.onWinEnter.subscribe((evt: Oni.EventContext) => this._remeasureWindow(evt))
        this._neovimInstance.autoCommands.onCursorMoved.subscribe((evt: Oni.EventContext) => this._remeasureWindow(evt))
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
    private async _remeasureWindow(context: Oni.EventContext): Promise<void> {

        const currentWin: any = await this._neovimInstance.request("nvim_get_current_win", [])

        const atomicCalls = [
            ["nvim_win_get_position", [currentWin.id]],
            ["nvim_win_get_width", [currentWin.id]],
            ["nvim_win_get_height", [currentWin.id]],
            ["nvim_buf_get_lines", [context.bufferNumber, context.windowTopLine - 1, context.windowBottomLine, false]],
        ]

        const response = await this._neovimInstance.request("nvim_call_atomic", [atomicCalls])

        const values = response[0]
        // Success if we received 4 items
        if (values.length === 4) {
            // const position = values[0]
            const width = values[1]
            // const height = values[2]
            const lines = values[3]

            const offset = context.wincol - context.column
            const contentWidth = width - offset

            const expandedLines = expandLines(lines, contentWidth)
            console.dir(expandedLines)
            
            // TODO: Create array of 'range' instead of line contents
            // Then, figure out the cursor position in window (using winline/wincol),
            // and create an array of ranges inside the current window
            //
            // This will then give us the bufferSpaceToScreenSpace, with the position
            // and then the pixel info gives us the rest...
        }

        // Some items, like signs or numbers, actually take up some space

        // Success if we received 4 items
        // if (values.length === 4) {
        //     const position = values[0]
        //     const width = values[1]
        //     const height = values[2]
        //     const lines = values[3]
        // }

        // const position = response[0]
        // const width = response[1]

        console.dir(values)
        
        console.log(this._screen.backgroundColor)
    }
}

const expandLines = (bufferLines: string[], width: number): string[] => {

    let expandedLines: string[] = []

    for(var i = 0; i < bufferLines.length; i++) {
        expandedLines = expandedLines.concat(splitLine(bufferLines[i], width))
    }

    return expandedLines
}

const splitLine = (bufferLine: string, width: number): string[] => {
    if (!bufferLine || !bufferLine.length) {
        return []
    }

    const length = bufferLine.length
    const chunks = []

    for(var i = 0; i < length; i += width) {
        chunks.push(bufferLine.substring(i, i + width))
    }

    return chunks
}
