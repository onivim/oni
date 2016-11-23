/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import { INeovimInstance } from "./../NeovimInstance"
import { BufferInfo, PluginManager } from "./../Plugins/PluginManager"

export class Formatter {

    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager

    private _bufferInfoAtRequest: BufferInfo

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager

        this._pluginManager.on("format", (response) => {
            debugger
        })
    }

    public formatBuffer(): void {
        this._bufferInfoAtRequest = this._pluginManager.currentBuffer

        this._pluginManager.requestFormat()
    }

}

