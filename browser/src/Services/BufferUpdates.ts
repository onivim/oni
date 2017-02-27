/**
 * BufferUpdates.ts
 * 
 * Responsible for taking "buffer-update" messages and sending them
 * to the plugins. Sanitizes and manages incrementental state.
 */

import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

export class BufferUpdates {

    private _lastArgs: Oni.EventContext
    private _lastBufferLines: string[] = []
    private _lastBufferVersion: number = -1
    private _canSendIncrementalUpdates: boolean = false

    public get version(): number {
        return this._lastBufferVersion
    }

    public get lines(): string[] {
        return this._lastBufferLines
    }

    constructor(
        private _neovimInstance: INeovimInstance,
        private _pluginManager: PluginManager
    ) {

        this._neovimInstance.on("mode-change", (mode: string) => {

            // If we were sending incremental updates, and we're moving out of insert mode, flush a full update
            if (this._canSendIncrementalUpdates && mode !== "insert") {
                this._pluginManager.notifyBufferUpdate(this._lastArgs, this._lastBufferLines)
            }

            this._canSendIncrementalUpdates = (mode === "insert")
        })

        this._neovimInstance.on("buffer-update", (args: Oni.EventContext, bufferLines: string[]) => {
            this._lastArgs = args
            this._lastBufferLines = bufferLines
            this._lastBufferVersion = args.version

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
