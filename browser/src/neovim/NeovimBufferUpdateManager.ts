/**
 * BufferUpdateManager.ts
 *
 * Helper for linking Neovim buffer updates with the `BufferChanged` event
 */

import * as os from "os"

import * as types from "vscode-languageserver-types"

import { Event, IEvent } from "oni-types"

import { Configuration } from "./../Services/Configuration"

import { EventContext, NeovimInstance } from "./../neovim"

export interface INeovimBufferUpdate {
    eventContext: EventContext
    contentChanges: types.TextDocumentContentChangeEvent[]
}

export type NeovimBufferLineEvent = [number, number, number, number, string[], boolean]

export class NeovimBufferUpdateManager {
    private _onBufferUpdateEvent = new Event<INeovimBufferUpdate>()
    // private _lastEventContext: EventContext
    // private _lastMode: string

    // private _isRequestInProgress: boolean = false
    // private _queuedRequest: EventContext

    private _trackedBuffers: Set<number> = new Set<number>()

    public get onBufferUpdate(): IEvent<INeovimBufferUpdate> {
        return this._onBufferUpdateEvent
    }

    constructor(private _configuration: Configuration, private _neovimInstance: NeovimInstance) {
        this._neovimInstance.autoCommands.onBufEnter.subscribe(async buf => {
            if (!this._trackedBuffers.has(buf.current.bufferNumber)) {
                if (this._shouldSubscribeToUpdates(buf.current)) {
                    this._trackedBuffers.add(buf.current.bufferNumber)
                    await this._neovimInstance.request("nvim_buf_attach", [
                        buf.current.bufferNumber,
                        true,
                        {},
                    ])
                }
            }
        })
    }

    public async handleUpdateEvent(lineEvent: NeovimBufferLineEvent): Promise<void> {
        const [bufferId, , firstLine, lastLine, linedata] = lineEvent

        const eventContext = await this._neovimInstance.getContext()

        if (eventContext.bufferNumber !== bufferId) {
            console.warn("Buffer ids don't match for update event")
        }

        const update: INeovimBufferUpdate = {
            eventContext,
            contentChanges: [
                {
                    range: types.Range.create(
                        firstLine,
                        0,
                        lastLine === -1 ? linedata.length : lastLine,
                        0,
                    ),
                    text: linedata.join(os.EOL) + os.EOL,
                },
            ],
        }

        this._onBufferUpdateEvent.dispatch(update)
    }

    private _shouldSubscribeToUpdates(context: EventContext): boolean {
        if (
            context.bufferTotalLines >
            this._configuration.getValue("editor.maxLinesForLanguageServices")
        ) {
            return false
        }

        return true
    }
}
