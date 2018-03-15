/**
 * SharedNeovimInstance.ts
 *
 * Specialized instance of Neovim, used as shared UX for non-traditional Vim components.
 * - Enabling Neovim keybindings on menus
 * - Enabling Neovim keybindings on trees
 * - Enabling Neovim keybindings on grids
 * - Enabling Neovim keybindings in text input elements
 */

import { Event, IDisposable, IEvent } from "oni-types"

import { NeovimInstance } from "./NeovimInstance"
import { INeovimStartOptions } from "./NeovimProcessSpawner"

import { PluginManager } from "./../Plugins/PluginManager"
import { commandManager } from "./../Services/CommandManager"
import { Configuration } from "./../Services/Configuration"

import { PromiseQueue } from "./../Services/Language/PromiseQueue"

import * as Log from "./../Log"

export interface IBinding {
    input(key: string): Promise<void>
    release(): void
}

export interface IMenuBinding extends IBinding {
    onCursorMoved: IEvent<string>

    setItems(ids: string[], focusedId?: string): Promise<void>
}

export class Binding implements IBinding {
    private _onReleasedEvent: Event<void> = new Event<void>()
    private _subscriptions: IDisposable[] = []

    public get onReleased(): IEvent<void> {
        return this._onReleasedEvent
    }

    protected get neovimInstance(): NeovimInstance {
        return this._neovimInstance
    }

    constructor(private _neovimInstance: NeovimInstance) {}

    public input(key: string): Promise<void> {
        return this._neovimInstance.input(key)
    }

    public release(): void {
        this._neovimInstance = null

        this._subscriptions.forEach(sub => sub.dispose())

        this._onReleasedEvent.dispatch()
    }

    protected trackDisposable(disposable: IDisposable): void {
        this._subscriptions.push(disposable)
    }
}

export class MenuBinding extends Binding implements IMenuBinding {
    private _currentOptions: string[] = []
    private _currentId: string = null
    private _onCursorMovedEvent: Event<string> = new Event<string>()
    private _promiseQueue = new PromiseQueue()

    private _isUpdating: boolean = false

    public get onCursorMoved(): IEvent<string> {
        return this._onCursorMovedEvent
    }

    constructor(neovimInstance: NeovimInstance) {
        super(neovimInstance)

        const subscription = this.neovimInstance.autoCommands.onCursorMoved.subscribe(evt => {
            if (this._isUpdating) {
                return
            }

            const line = evt.line - 1
            if (line < this._currentOptions.length) {
                this._onCursorMovedEvent.dispatch(this._currentOptions[line])
            }
        })

        this.trackDisposable(subscription)
    }

    public async setItems(items: string[], activeId?: string): Promise<void> {
        this._promiseQueue.enqueuePromise(async () => {
            if (items === this._currentOptions && activeId === this._currentId) {
                return
            }

            this._isUpdating = true

            this._currentOptions = items
            this._currentId = activeId

            if (!this.neovimInstance.isInitialized) {
                return
            }
            const currentWinId = await this.neovimInstance.request("nvim_get_current_win", [])
            const currentBufId = await this.neovimInstance.eval("bufnr('%')")
            const bufferLength = await this.neovimInstance.eval<number>("line('$')")

            const elems = []

            for (let i = 0; i < this._currentOptions.length; i++) {
                elems.push(i.toString())
            }

            let idx = 1
            if (activeId) {
                idx = this._currentOptions.indexOf(activeId) + 1
            }

            await this.neovimInstance.request("nvim_buf_set_lines", [
                currentBufId,
                0,
                bufferLength,
                false,
                elems,
            ])
            await this.neovimInstance.request("nvim_win_set_cursor", [currentWinId, [idx, 1]])
            this._isUpdating = false
        })
    }
}

class SharedNeovimInstance implements SharedNeovimInstance {
    private _neovimInstance: NeovimInstance

    public get isInitialized(): boolean {
        return this._neovimInstance.isInitialized
    }

    constructor(private _configuration: Configuration, private _pluginManager: PluginManager) {
        this._neovimInstance = new NeovimInstance(5, 5, this._configuration)

        this._neovimInstance.onOniCommand.subscribe((command: string) => {
            commandManager.executeCommand(command)
        })
    }

    public bindToMenu(): IMenuBinding {
        return new MenuBinding(this._neovimInstance)
    }

    public async start(): Promise<void> {
        const startOptions: INeovimStartOptions = {
            runtimePaths: this._pluginManager.getAllRuntimePaths(),
            loadInitVim: false,
            useDefaultConfig: true,
        }

        Log.info("[SharedNeovimInstance::start] Starting...")
        await this._neovimInstance.start(startOptions)
        Log.info("[SharedNeovimInstance::start] Started successfully!")
    }

    public async quit(): Promise<void> {
        return this._neovimInstance.quit()
    }
}

let _sharedInstance: SharedNeovimInstance = null
export const activate = async (
    configuration: Configuration,
    pluginManager: PluginManager,
): Promise<void> => {
    if (_sharedInstance) {
        return
    }

    _sharedInstance = new SharedNeovimInstance(configuration, pluginManager)
    await _sharedInstance.start()
}

export const getInstance = (): SharedNeovimInstance => {
    return _sharedInstance
}
