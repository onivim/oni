/**
 * NeovimMenuInstance.ts
 *
 * Specialized instance of Neovim, equipped for dealing with menu UX
 */

import { Event, IEvent } from "oni-types"

import { NeovimInstance } from "./NeovimInstance"

import { pluginManager } from "./../Plugins/PluginManager"
import { commandManager } from "./../Services/CommandManager"

export interface INeovimMenuOption<T> {
    id: string
    data: T
}

export interface INeovimMenuInstance<T> {

    setOptions(options: INeovimMenuOption<T>[]): Promise<void>

    input(input: string): Promise<void>

    onCursorPositionChanged: IEvent<INeovimMenuOption<T>>

    // onSelectionChanged(): IEvent<INeovimMenuOption[]>
}

// TODO: We should not be making multiple instances of this class for each menu UI
// Need to come with a paradigm to reuse them across instances (attach/detach)

export class NeovimMenuInstance<T> implements INeovimMenuInstance<T> {

    private _initPromise: Promise<void>
    private _neovimInstance: NeovimInstance

    private _currentOptions: INeovimMenuOption<T>[] = []
    private _cursorPositionChangedEvent: Event<INeovimMenuOption<T>> = new Event<INeovimMenuOption<T>>()

    public get onCursorPositionChanged(): IEvent<INeovimMenuOption<T>> {
        return this._cursorPositionChangedEvent
    }

    constructor() {
        this._neovimInstance = new NeovimInstance(5, 5)

        this._neovimInstance.on("event", (eventName: string, evt: any) => {
            const line = evt.line - 1

            if (eventName === "CursorMoved") {
                if (line < this._currentOptions.length) {
                    this._cursorPositionChangedEvent.dispatch(this._currentOptions[line])
                }
            }
        })

        this._neovimInstance.onOniCommand.subscribe((command: string) => {
            commandManager.executeCommand(command)
        })
    }

    public async start(): Promise<void> {
        this._initPromise = this._neovimInstance.start([], { runtimePaths: pluginManager.getAllRuntimePaths() })

        await this._initPromise
    }

    public async input(input: string): Promise<void> {
        await this._neovimInstance.input(input)
    }

    public async setOptions(options: INeovimMenuOption<T>[]): Promise<void> {

        this._currentOptions = options

        await this._initPromise

        const currentBufId = await this._neovimInstance.eval("bufnr('%')")
        const bufferLength = await this._neovimInstance.eval<number>("line('$')")

        const elems = []

        for (let i = 0; i < this._currentOptions.length; i++) {
            elems.push(i.toString())
        }

        await this._neovimInstance.request("nvim_buf_set_lines", [currentBufId, 0, bufferLength - 1, false, elems])
    }
}
