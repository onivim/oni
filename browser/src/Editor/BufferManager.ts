/**
 * BufferManager.ts
 *
 * Helpers to manage buffer state
 */
import { NeovimInstance } from "./../neovim"

import { languageManager } from "./../Services/Language"

export class Buffer implements Oni.Buffer {

    private _id: string
    private _filePath: string
    private _language: string
    private _cursor: Oni.Cursor
    private _version: number
    private _modified: boolean
    private _lineCount: number

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
                evt: Oni.EventContext) {
        this.updateFromEvent(evt)
    }

    public getLines(start?: number, end?: number): Promise<string[]> {
        // TODO:
        return Promise.resolve([])
    }

    public async getTokenAt(line: number, column: number): Promise<string> {
        const result = await this._neovimInstance.request<any>("nvim_buf_get_lines", [parseInt(this._id, 10), line, line + 1, false])

        const tokenRegEx = languageManager.getTokenRegex(this.language)

        const getToken = (lineContents: string, character: number): string => {
            const tokenStart = getLastMatchingCharacter(lineContents, character, -1, tokenRegEx)
            const tokenEnd = getLastMatchingCharacter(lineContents, character, 1, tokenRegEx)

            return lineContents.substring(tokenStart, tokenEnd + 1)
        }

        const getLastMatchingCharacter = (lineContents: string, character: number, dir: number, regex: RegExp) => {
            while (character >= 0 && character < lineContents.length) {
                if (!lineContents[character].match(regex)) {
                    return character - dir
                }

                character += dir
            }

            return character
        }

        return getToken(result[0], column)
    }

    public updateFromEvent(evt: Oni.EventContext): void {
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

    constructor(private _neovimInstance: NeovimInstance) { }

    public updateBufferFromEvent(evt: Oni.EventContext): Oni.Buffer {
        const id = evt.bufferNumber.toString()
        const currentBuffer = this.getBufferById(id)

        if (evt.bufferFullPath) {
            this._filePathToId[evt.bufferFullPath] = id
        }

        if (currentBuffer) {
            currentBuffer.updateFromEvent(evt)
        } else {
            const buf = new Buffer(this._neovimInstance, evt)
            this._idToBuffer[id] = buf
        }

        return this._idToBuffer[id]
    }

    public getBufferById(id: string): Buffer {
        return this._idToBuffer[id]
    }
}
