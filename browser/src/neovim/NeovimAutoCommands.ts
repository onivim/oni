/**
 * NeovimAutoCommands.ts
 *
 * Strongly typed interface to Neovim's autocommands
 * - To add a new autocommand, make sure it is registered in `init.vim` in the `OniEventListeners` augroup
 */

import { Event, IEvent } from "oni-types"

import { NeovimInstance } from "./NeovimInstance"

export interface INeovimAutoCommands {
    // Autocommands
    onBufEnter: IEvent<Oni.EventContext>
    onBufWinEnter: IEvent<Oni.EventContext>
    onWinEnter: IEvent<Oni.EventContext>
    onCursorMoved: IEvent<Oni.EventContext>
    onCursorMovedI: IEvent<Oni.EventContext>
    onVimResized: IEvent<Oni.EventContext>

    executeAutoCommand(autoCommand: string): Promise<void>
}

export class NeovimAutoCommands {
    // Autocommand events
    private _nameToEvent: { [key: string]: Event<Oni.EventContext> }
    private _onBufEnterEvent = new Event<Oni.EventContext>()
    private _onBufWinEnterEvent = new Event<Oni.EventContext>()
    private _onWinEnterEvent = new Event<Oni.EventContext>()
    private _onCursorMovedEvent = new Event<Oni.EventContext>()
    private _onCursorMovedIEvent = new Event<Oni.EventContext>()
    private _onVimResizedEvent = new Event<Oni.EventContext>()

    public get onBufEnter(): IEvent<Oni.EventContext> {
        return this._onBufEnterEvent
    }

    public get onBufWinEnter(): IEvent<Oni.EventContext> {
        return this._onBufWinEnterEvent
    }

    public get onWinEnter(): IEvent<Oni.EventContext> {
        return this._onWinEnterEvent
    }

    public get onCursorMoved(): IEvent<Oni.EventContext> {
        return this._onCursorMovedEvent
    }

    public get onCursorMovedI(): IEvent<Oni.EventContext> {
        return this._onCursorMovedIEvent
    }

    public get onVimResized(): IEvent<Oni.EventContext> {
        return this._onVimResizedEvent
    }

    constructor(private _neovimInstance: NeovimInstance) {
        this._nameToEvent = {
            "BufEnter": this._onBufEnterEvent,
            "BufWinEnter": this._onBufWinEnterEvent,
            "CursorMoved": this._onCursorMovedEvent,
            "CursorMovedI": this._onCursorMovedIEvent,
            "WinEnter": this._onWinEnterEvent,
            "VimResized": this._onVimResizedEvent,
        }
    }

    public notifyAutocommand(autoCommandName: string, context: Oni.EventContext): void {

        const evt = this._nameToEvent[autoCommandName]

        if (!evt) {
            return
        }

        evt.dispatch(context)
    }

    public async executeAutoCommand(autoCommand: string): Promise<void> {
        const doesAutoCommandExist = await this._neovimInstance.eval(`exists('#${autoCommand}')`)

        if (doesAutoCommandExist) {
            await this._neovimInstance.command(`doautocmd <nomodeline> ${autoCommand}`)
        }
    }
}
