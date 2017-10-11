/**
 * BufferUpdates.ts
 *
 * Responsible for taking "buffer-update" messages and sending them
 * to the plugins. Sanitizes and manages incrementental state.
 */

import { IFullBufferUpdateEvent, IIncrementalBufferUpdateEvent, INeovimInstance } from "./../neovim"
import { PluginManager } from "./../Plugins/PluginManager"

export class BufferUpdates {

    private _lastArgs: Oni.EventContext
    private _lastBufferLines: string[] = []
    private _modified: boolean = false
    private _lastBufferVersion: number = -1
    private _canSendIncrementalUpdates: boolean = false

    public get modified(): boolean {
        return this._modified
    }

    public get version(): number {
        return this._lastBufferVersion
    }

    public get lines(): string[] {
        return this._lastBufferLines
    }

    constructor(
        private _neovimInstance: INeovimInstance,
        private _pluginManager: PluginManager,
    ) {

        this._neovimInstance.on("mode-change", (mode: string) => {

            // If we were sending incremental updates, and we're moving out of insert mode, flush a full update
            if (this._canSendIncrementalUpdates && mode !== "insert") {
                this._pluginManager.notifyBufferUpdate(this._lastArgs, this._lastBufferLines)
            }

            this._canSendIncrementalUpdates = (mode === "insert")
        })

        this._neovimInstance.onBufferUpdate.subscribe((args: IFullBufferUpdateEvent) => {
            const lastLine = args.context.line
            this._lastArgs = args.context
            this._lastBufferLines = args.bufferLines
            this._modified = args.context.modified
            this._lastBufferVersion = args.context.version

            // If we can send incremental updates, and the line hasn't changed, just send the incremental change
            if (this._canSendIncrementalUpdates && lastLine === args.context.line) {
                const changedLine = args.bufferLines[args.context.line - 1]
                this._pluginManager.notifyBufferUpdateIncremental(args.context, args.context.line, changedLine)
            } else {
                this._pluginManager.notifyBufferUpdate(args.context, args.bufferLines)
            }
        })

        this._neovimInstance.onBufferUpdateIncremental.subscribe((args: IIncrementalBufferUpdateEvent) => {
            const { context, lineNumber, lineContents } = args
            this._lastArgs = context
            this._lastBufferLines[lineNumber - 1] = lineContents
            this._modified = context.modified
            this._lastBufferVersion = context.version

            this._pluginManager.notifyBufferUpdateIncremental(context, lineNumber, lineContents)
        })
    }
}
