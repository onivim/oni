import { EventEmitter } from "events"

import { IScreen } from "./../Screen"

import { IWindow, NeovimInstance } from "./index"

export class NeovimWindowManager extends EventEmitter {

    private _screen: IScreen
    private _neovimInstance: NeovimInstance

    constructor(screen: IScreen, neovimInstance: NeovimInstance) {
        super()

        this._screen = screen
        this._neovimInstance = neovimInstance

        this._neovimInstance.autoCommands.onBufEnter.subscribe((evt: Oni.EventContext) => this._remeasureWindow(evt))
        this._neovimInstance.autoCommands.onWinBufEnter.subscribe((evt: Oni.EventContext) => this._remeasureWindow(evt))
        this._neovimInstance.autoCommands.onWinEnter.subscribe((evt: Oni.EventContext) => this._remeasureWindow(evt))
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
    private _remeasureWindow(context: Oni.EventContext): void {
    }

}
