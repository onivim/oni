/**
 * BufferManager.ts
 *
 * Helpers to manage buffer state
 */

import * as os from "os"
import * as types from "vscode-languageserver-types"

import { Observable } from "rxjs/Observable"

import "rxjs/add/observable/defer"
import "rxjs/add/observable/from"
import "rxjs/add/operator/concatMap"

import * as Oni from "oni-api"

import { EventContext, NeovimInstance } from "./../neovim"
import * as LanguageManager from "./../Services/Language"
import { PromiseQueue } from "./../Services/Language/PromiseQueue"

import * as SyntaxHighlighting from "./../Services/SyntaxHighlighting"

import { BufferHighlightId, BufferHighlightsUpdater, IBufferHighlightsUpdater } from "./BufferHighlights"

import * as Actions from "./NeovimEditor/NeovimEditorActions"

import * as Constants from "./../Constants"
import * as Log from "./../Log"

export interface IBuffer extends Oni.Buffer {
    getCursorPosition(): Promise<types.Position>
}

export class Buffer implements Oni.Buffer {

    private _id: string
    private _filePath: string
    private _language: string
    private _cursor: Oni.Cursor
    private _version: number
    private _modified: boolean
    private _lineCount: number
    private _bufferHighlightId: BufferHighlightId = null

    private _promiseQueue = new PromiseQueue()

    public get filePath(): string {
        return this._filePath
    }

    public get language(): string {
        return this._language
    }

    public get lineCount(): number {
        return this._lineCount
    }

    public get cursor(): Oni.Cursor {
        return this._cursor
    }

    public get version(): number {
        return this._version
    }

    public get modified(): boolean {
        return this._modified
    }

    public get id(): string {
        return this._id
    }

    constructor(private _neovimInstance: NeovimInstance,
                private _actions: typeof Actions,
                evt: EventContext) {
        this.updateFromEvent(evt)
    }

    public addLayer(layer: Oni.EditorLayer): void {
        this._actions.addBufferLayer(parseInt(this._id, 10), layer)
    }

    public async getCursorPosition(): Promise<types.Position> {
       const pos = await this._neovimInstance.callFunction("getpos", ["."])
       const [, oneBasedLine, oneBasedColumn] = pos
       return types.Position.create(oneBasedLine - 1, oneBasedColumn - 1)
    }

    public async getLines(start?: number, end?: number): Promise<string[]> {

        if (typeof start !== "number") {
            start = 0
        }

        if (typeof end !== "number") {
            end = this._lineCount
        }

        if (end - start > 2500) {
            Log.warn("getLines called with over 2500 lines, this may cause instability.")
        }

        const lines = await this._neovimInstance.request<any>("nvim_buf_get_lines", [parseInt(this._id, 10), start, end, false])
        return lines
    }

    public async setLanguage(language: string): Promise<void> {
        await this._neovimInstance.request<any>("nvim_buf_set_option", [parseInt(this._id, 10), "filetype", language])
    }

    public async applyTextEdits(textEdits: types.TextEdit | types.TextEdit[]): Promise<void> {

        const textEditsAsArray = textEdits instanceof Array ? textEdits : [textEdits]

        const sortedEdits = LanguageManager.sortTextEdits(textEditsAsArray)

        const deferredEdits = sortedEdits.map((te) => {
            return Observable.defer(async () => {
                const range = te.range
                Log.info("[Buffer] Applying edit")

                const characterStart = range.start.character
                const lineStart = range.start.line
                const lineEnd = range.end.line
                const characterEnd = range.end.character

                const calls = []

                calls.push(["nvim_command", ["silent! undojoin"]])

                if (lineStart === lineEnd) {
                    const [lineContents] = await this.getLines(lineStart, lineStart + 1)
                    const beginning = lineContents.substring(0, range.start.character)
                    const end = lineContents.substring(range.end.character, lineContents.length)
                    const newLine = beginning + te.newText + end

                    const lines = newLine.split(os.EOL)

                    calls.push(["nvim_buf_set_lines", [parseInt(this._id, 10), lineStart, lineStart + 1, false, lines ]])
                } else if (characterEnd === 0 && characterStart === 0) {
                    const lines = te.newText.split(os.EOL)
                    calls.push(["nvim_buf_set_lines", [parseInt(this._id, 10), lineStart, lineEnd, false, lines ]])
                } else {
                    Log.warn("Multi-line mid character edits not currently supported")
                }

                await this._neovimInstance.request("nvim_call_atomic", [calls])
            })
        })

        await Observable.from(deferredEdits)
                .concatMap(de => de)
                .toPromise()
    }

    public async getOrCreateHighlightGroup(highlight: SyntaxHighlighting.IHighlight | string): Promise<SyntaxHighlighting.HighlightGroupId> {
        if (typeof highlight === "string") {
            return highlight
        } else {
            // TODO: needed for theming integration!
            return null
        }
    }

    public async updateHighlights(updateFunction: (highlightsUpdater: IBufferHighlightsUpdater) => void): Promise<void> {
        this._promiseQueue.enqueuePromise(async () => {
            const bufferId = parseInt(this._id, 10)
            const bufferUpdater = new BufferHighlightsUpdater(bufferId, this._neovimInstance, this._bufferHighlightId)
            await bufferUpdater.start()

            updateFunction(bufferUpdater)

            this._bufferHighlightId = await bufferUpdater.apply()
        })
    }

    public async setLines(start: number, end: number, lines: string[]): Promise<void> {
        return this._neovimInstance.request<any>("nvim_buf_set_lines", [parseInt(this._id, 10), start, end, false, lines])
    }

    public async setCursorPosition(row: number, column: number): Promise<void> {
        await this._neovimInstance.eval(`setpos(".", [${this._id}, ${row + 1}, ${column + 1}, 0])`)
    }

    public async getSelectionRange(): Promise<types.Range | null> {
        const startRange = await this._neovimInstance.callFunction("getpos", ["'<'"])
        const endRange = await this._neovimInstance.callFunction("getpos", ["'>"])

        const [, startLine, startColumn ] = startRange
        let [, endLine, endColumn ] = endRange

        if (startLine === 0 && startColumn === 0 && endLine === 0 && endColumn === 0) {
            return null
        }

        if (endColumn === Constants.Vim.MAX_VALUE) {
            endLine++
            endColumn = 1
        }

        return types.Range.create(startLine - 1, startColumn - 1, endLine - 1, endColumn - 1)
    }

    public async getTokenAt(line: number, column: number): Promise<Oni.IToken> {
        const result = await this.getLines(line, line + 1)

        const tokenRegEx = LanguageManager.getInstance().getTokenRegex(this.language)

        const getLastMatchingCharacter = (lineContents: string, character: number, dir: number, regex: RegExp) => {
            while (character > 0 && character < lineContents.length) {
                if (!lineContents[character].match(regex)) {
                    return character - dir
                }

                character += dir
            }

            return character
        }

        const getToken = (lineContents: string, character: number): Oni.IToken => {
            const tokenStart = getLastMatchingCharacter(lineContents, character, -1, tokenRegEx)
            const tokenEnd = getLastMatchingCharacter(lineContents, character, 1, tokenRegEx)

            const range = types.Range.create(line, tokenStart, line, tokenEnd)
            const tokenName = lineContents.substring(tokenStart, tokenEnd + 1)

            return {
                tokenName,
                range,
            }
        }

        return getToken(result[0], column)
    }

    public updateFromEvent(evt: EventContext): void {
        this._id = evt.bufferNumber.toString()
        this._filePath = evt.bufferFullPath
        this._language = evt.filetype
        this._version = evt.version
        this._modified = evt.modified
        this._lineCount = evt.bufferTotalLines

        this._cursor = {
            line: evt.line - 1,
            column: evt.column - 1,
        }
    }
}

// Helper for managing buffer state
export class BufferManager {
    private _idToBuffer: { [id: string]: Buffer } = { }
    private _filePathToId: { [filePath: string]: string } = { }

    constructor(
        private _neovimInstance: NeovimInstance,
        private _actions: typeof Actions) { }

    public updateBufferFromEvent(evt: EventContext): Buffer {
        const id = evt.bufferNumber.toString()
        const currentBuffer = this.getBufferById(id)

        if (evt.bufferFullPath) {
            this._filePathToId[evt.bufferFullPath] = id
        }

        if (currentBuffer) {
            currentBuffer.updateFromEvent(evt)
        } else {
            const buf = new Buffer(this._neovimInstance, this._actions, evt)
            this._idToBuffer[id] = buf
        }

        return this._idToBuffer[id]
    }

    public getBufferById(id: string): Buffer {
        return this._idToBuffer[id]
    }
}
