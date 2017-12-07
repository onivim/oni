/**
 * BufferUpdates.ts
 *
 * Helper for linking Neovim buffer updates with the `BufferChanged` event
 */

import * as os from "os"

import * as types from "vscode-languageserver-types"

import * as Oni from "oni-api"

import * as Log from "./../Log"

import { Observable } from "rxjs/Observable"

import "rxjs/add/observable/merge"

import { IFullBufferUpdateEvent, IIncrementalBufferUpdateEvent, NeovimInstance } from "./../neovim"
import { BufferManager } from "./BufferManager"

export const listenForBufferUpdates = (neovimInstance: NeovimInstance, bufferManager: BufferManager): Observable<Oni.EditorBufferChangedEventArgs> => {

    const bufferUpdates$ = neovimInstance.onBufferUpdate.asObservable()
    const bufferIncrementalUpdates$ = neovimInstance.onBufferUpdateIncremental.asObservable()

    const normalizedBufferUpdate$: Observable<Oni.EditorBufferChangedEventArgs> = bufferUpdates$
        .map((bufferUpdateEvent: IFullBufferUpdateEvent) => {
            const args = bufferUpdateEvent.context

            const buf = bufferManager.updateBufferFromEvent(args)

            return {
                buffer: buf,
                contentChanges: [{ text: bufferUpdateEvent.bufferLines.join(os.EOL) }],
            }
        })

    const normalizedBufferIncrementalUpdate$: Observable<Oni.EditorBufferChangedEventArgs> = bufferIncrementalUpdates$
        .map((bufferUpdateArgs: IIncrementalBufferUpdateEvent) => {

            const args = bufferUpdateArgs.context
            const lineNumber = bufferUpdateArgs.lineNumber
            const changedLine = bufferUpdateArgs.lineContents

            const buf = bufferManager.updateBufferFromEvent(args)

            // Don't process the update if it is behind the current version
            if (args.version < buf.version) {
                Log.warn("[Neovim Editor] Skipping incremental update because version is out of date")
                return null
            }

            return {
                buffer: buf,
                contentChanges: [{
                    range: types.Range.create(lineNumber - 1, 0, lineNumber, 0),
                    text: changedLine + os.EOL,
                }],
            }
        })

    const combinedObservable$ = Observable.merge(normalizedBufferUpdate$, normalizedBufferIncrementalUpdate$)

    return combinedObservable$
}
