/**
 * BufferUpdates.ts
 * 
 * Responsible for taking "buffer-update" messages and sending them
 * to the plugins. Sanitizes and manages incrementental state.
 */

import * as _ from "lodash"
import * as Q from "q"

import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

export class BufferUpdates {
    private _lastBufferLines: string[] = []

    constructor(
        private _neovimInstance: INeovimInstance,
        private _pluginManager: PluginManager
    ) {

        this._neovimInstance.on("buffer-update", (args: Oni.EventContext, bufferLines: string[]) => {
            this._lastBufferLines = bufferLines
            this._pluginManager.notifyBufferUpdate(args, bufferLines)
        })
    }
}
