/**
 * QuickOpen.ts
 *
 * Manages the quick open menu
 */

import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

export class Formatter {

    private _neovimInstance: INeovimInstance
    private _pluginManager: PluginManager

    constructor(neovimInstance: INeovimInstance, pluginManager: PluginManager) {
        this._neovimInstance = neovimInstance
        this._pluginManager = pluginManager
    }

    public formatDocument(): void {
        alert("hey")
    }

}

