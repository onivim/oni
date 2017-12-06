/**
 * SharedNeovimInstance.ts
 *
 * Specialized instance of Neovim, used as shared UX for non-traditional Vim components.
 * - Enabling Neovim keybindings on menus
 * - Enabling Neovim keybindings on trees
 * - Enabling Neovim keybindings on grids
 * - Enabling Neovim keybindings in text input elements
 */

import { Event,  IEvent } from "oni-types"

import { NeovimInstance } from "./NeovimInstance"
import { INeovimStartOptions } from "./NeovimProcessSpawner"

import { pluginManager } from "./../Plugins/PluginManager"
import { commandManager } from "./../Services/CommandManager"

export interface IBinding {
    input(key: string): Promise<void>
    release(): void
}

export interface IMenuBinding extends IBinding {
    setItems(ids: string[]): Promise<void>

    onCursorMoved: IEvent<string>
    onSelectionChanged: IEvent<string[]>
}

export class Binding implements IBinding {
    private _onReleasedEvent: Event<void> = new Event<void>()

    public get onReleased(): IEvent<void> {
        return this._onReleasedEvent
    }

    protected get neovimInstance(): NeovimInstance {
        return this._neovimInstance
    }

    constructor(
        private _neovimInstance: NeovimInstance,
    ) { }

    public input(key: string): Promise<void> {
        return this._neovimInstance.input(key)
    }

    public release(): void {
        this._neovimInstance = null
        this._onReleasedEvent.dispatch()
    }
}

export class MenuBinding extends Binding implements IMenuBinding {

    private _currentOptions: string[] = []

    private _onCursorMovedEvent: Event<string> = new Event<string>()
    private _onSelectionChangedEvent: Event<string[]> = new Event<string[]>()

    public get onCursorMoved(): IEvent<string> {
        return this._onCursorMovedEvent
    }

    public get onSelectionChanged(): IEvent<string[]> {
        return this._onSelectionChangedEvent
    }

    constructor(neovimInstance: NeovimInstance) {
        super(neovimInstance)
    }

    public async setItems(items: string[]): Promise<void> {
        this._currentOptions = items
        console.dir(this._currentOptions)

        // TODO: set items here
    }
}

// TODO: We should not be making multiple instances of this class for each menu UI
// Need to come with a paradigm to reuse them across instances (attach/detach)

class SharedNeovimInstance implements SharedNeovimInstance {

    private _initPromise: Promise<void>
    private _neovimInstance: NeovimInstance

    // private _currentOptions: Array<INeovimMenuOption<T>> = []
    // private _cursorPositionChangedEvent: Event<INeovimMenuOption<T>> = new Event<INeovimMenuOption<T>>()

    // public get onCursorPositionChanged(): IEvent<INeovimMenuOption<T>> {
    //     return this._cursorPositionChangedEvent
    // }

    public bindToMenu(): IMenuBinding {
        return new MenuBinding(this._neovimInstance)
    }

    constructor() {
        this._neovimInstance = new NeovimInstance(5, 5)

        // this._neovimInstance.on("event", (eventName: string, evt: any) => {
        //     const line = evt.line - 1

        //     if (eventName === "CursorMoved") {
        //         if (line < this._currentOptions.length) {
        //             this._cursorPositionChangedEvent.dispatch(this._currentOptions[line])
        //         }
        //     }
        // })

        this._neovimInstance.onOniCommand.subscribe((command: string) => {
            commandManager.executeCommand(command)
        })
    }

    public async start(): Promise<void> {
        const startOptions: INeovimStartOptions = {
            args: [],
            runtimePaths: pluginManager.getAllRuntimePaths(),
        }

        this._initPromise = this._neovimInstance.start(startOptions)

        await this._initPromise
    }

    // public async input(input: string): Promise<void> {
    //     await this._neovimInstance.input(input)
    // }

//     public async setOptions(options: Array<INeovimMenuOption<T>>): Promise<void> {

//         this._currentOptions = options

//         await this._initPromise

//         const currentBufId = await this._neovimInstance.eval("bufnr('%')")
//         const bufferLength = await this._neovimInstance.eval<number>("line('$')")

//         const elems = []

//         for (let i = 0; i < this._currentOptions.length; i++) {
//             elems.push(i.toString())
//         }

//         await this._neovimInstance.request("nvim_buf_set_lines", [currentBufId, 0, bufferLength - 1, false, elems])
//     }
}

let _sharedInstance: SharedNeovimInstance = null
export const getInstance = (): SharedNeovimInstance => {

    if (!_sharedInstance) {
        _sharedInstance = new SharedNeovimInstance()
        _sharedInstance.start()
    }

    return _sharedInstance
}
