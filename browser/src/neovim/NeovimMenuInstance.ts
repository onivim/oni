/**
 * NeovimMenuInstance.ts
 *
 * Specialized instance of Neovim, equipped for dealing with menu UX
 */

import { Event, IEvent } from "./../Event"

import { NeovimInstance } from "./NeovimInstance"

import { pluginManager } from "./../Plugins/PluginManager"

export interface INeovimMenuOption {
    id: string
    data: any
}

export interface INeovimMenuInstance {

    setOptions(options: INeovimMenuOption[]): Promise<void>

    input(input: string): Promise<void>

    onCursorPositionChanged: IEvent<INeovimMenuOption>

    // onSelectionChanged(): IEvent<INeovimMenuOption[]>
}

// TODO: We should not be making multiple instances of this class for each menu UI
// Need to come with a paradigm to reuse them across instances (attach/detach)

export class NeovimMenuInstance implements INeovimMenuInstance {

    private _initPromise: Promise<void>
    private _neovimInstance: NeovimInstance

    private _currentOptions: INeovimMenuOption[] = []
    private _cursorPositionChangedEvent: Event<INeovimMenuOption> = new Event<INeovimMenuOption>()

    public get onCursorPositionChanged(): IEvent<INeovimMenuOption> {
        return this._cursorPositionChangedEvent
    }

    constructor() {
        this._neovimInstance = new NeovimInstance(5, 5)
        this._initPromise = this._neovimInstance.start([], { runtimePaths: pluginManager.getAllRuntimePaths() })

        this._neovimInstance.on("event", (eventName: string, evt: any) => {
            const line = evt.line

            if (eventName === "CursorMoved") {
                if (line < this._currentOptions.length) {
                    this._cursorPositionChangedEvent.dispatch(this._currentOptions[line])
                }
            }
        })
    }

    public async input(input: string): Promise<void> {
        await this._neovimInstance.input(input)
    }

    public async setOptions(options: INeovimMenuOption[]): Promise<void> {

        this._currentOptions = options

        await this._initPromise

        const currentBufId = await this._neovimInstance.eval("bufnr('%)'")

        const elems = []

        for (let i = 0; i < this._currentOptions.length; i++) {
            elems.push(i.toString())
        }

        await this._neovimInstance.request("nvim_buf_set_lines", [currentBufId, 0, 1, false, elems])
    }
}
