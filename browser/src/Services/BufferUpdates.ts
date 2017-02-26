/**
 * BufferUpdates.ts
 * 
 * Responsible for taking "buffer-update" messages and sending them
 * to the plugins. Sanitizes and manages incrementental state.
 */

import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

export class BufferUpdates {
    private _lastBufferLines: string[] = []
    private _canSendIncrementalUpdates: boolean = false

    constructor(
        private _neovimInstance: INeovimInstance,
        private _pluginManager: PluginManager
    ) {

        this._neovimInstance.on("mode-change", (mode: string) => {
            this._canSendIncrementalUpdates = (mode === "insert")
        })

        this._neovimInstance.on("buffer-update", (args: Oni.EventContext, bufferLines: string[]) => {
            this._lastBufferLines = bufferLines

            if (this._canSendIncrementalUpdates) {
                const changedLine = bufferLines[args.line - 1]
                console.log("Incremental update")
                this._pluginManager.notifyBufferUpdateIncremental(args, args.line, changedLine)
            } else {
                console.log("Full update")
                this._pluginManager.notifyBufferUpdate(args, bufferLines)
            }
        })
    }
}
