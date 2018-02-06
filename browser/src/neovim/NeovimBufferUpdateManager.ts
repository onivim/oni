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

export class NeovimBufferUpdateManager {
    private _onBufferUpdateEvent = new Event<INeovimBufferUpdate>()
    private _lastEventContext: EventContext

    public get onBufferUpdate(): IEvent<INeovimBufferUpdate> {
        return this._onBufferUpdateEvent
    }

    constructor(private _configuration: Configuration, private _neovimInstance: NeovimInstance) {}

    public async notifyFullBufferUpdate(eventContext: EventContext): Promise<void> {
        if (!this._shouldSubscribeToUpdates(eventContext)) {
            return
        }

        this._doFullUpdate(eventContext)
    }

    public notifyIncrementalBufferUpdate(
        eventContext: EventContext,
        lineNumber: number,
        lineContents: string,
    ): void {
        if (!this._shouldSubscribeToUpdates(eventContext)) {
            return
        }

        const shouldDoFullUpdate = this._shouldDoFullUpdate(eventContext, this._lastEventContext)

        if (shouldDoFullUpdate) {
            this._doFullUpdate(eventContext)
            return
        }

        const changedLine = lineContents

        const update: INeovimBufferUpdate = {
            eventContext,
            contentChanges: [
                {
                    range: types.Range.create(lineNumber - 1, 0, lineNumber, 0),
                    text: changedLine + os.EOL,
                },
            ],
        }

        this._onBufferUpdateEvent.dispatch(update)
    }

    private async _doFullUpdate(eventContext: EventContext): Promise<void> {
        const bufferLines = await this._neovimInstance.request<string[]>("nvim_buf_get_lines", [
            eventContext.bufferNumber,
            0,
            eventContext.bufferTotalLines,
            false,
        ])

        const update: INeovimBufferUpdate = {
            eventContext,
            contentChanges: [{ text: bufferLines.join(os.EOL) }],
        }

        this._lastEventContext = eventContext
        this._onBufferUpdateEvent.dispatch(update)
    }

    private _shouldDoFullUpdate(
        currentContext: EventContext,
        previousContext: EventContext,
    ): boolean {
        if (!previousContext) {
            return true
        }

        if (currentContext.bufferFullPath !== previousContext.bufferFullPath) {
            return true
        }

        if (currentContext.bufferTotalLines !== previousContext.bufferTotalLines) {
            return true
        }

        return false
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
