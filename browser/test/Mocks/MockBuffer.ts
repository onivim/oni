/**
 * Mocks/index.ts
 *
 * Implementations of test mocks and doubles,
 * to exercise boundaries of class implementations
 */

export * from "./MockPluginManager"
export * from "./MockThemeLoader"

import * as Oni from "oni-api"

import * as types from "vscode-languageserver-types"

import { IBufferHighlightsUpdater } from "./../../src/Editor/BufferHighlights"
import { BufferIndentationInfo } from "./../../src/Editor/BufferManager"

import { HighlightInfo } from "./../../src/Services/SyntaxHighlighting"

export class MockBuffer {
    private _mockHighlights = new MockBufferHighlightsUpdater()
    private _cursor = { line: 0, column: 0 }
    private _modified = false

    private _indentationInfo: BufferIndentationInfo = {
        indent: "   ",
        type: "space",
        amount: 3,
    }

    public get id(): number {
        return this._id
    }

    public get language(): string {
        return this._language
    }

    public get filePath(): string {
        return this._filePath
    }

    public get lineCount(): number {
        return this._lines.length
    }

    public get mockHighlights(): MockBufferHighlightsUpdater {
        return this._mockHighlights
    }

    public get cursor(): Oni.Cursor {
        return this._cursor
    }

    public get modified(): boolean {
        return this._modified
    }

    public constructor(
        private _language: string = "test_language",
        private _filePath: string = "test_filepath",
        private _lines: string[] = [],
        private _id: number = 1,
    ) {}

    public async detectIndentation(): Promise<BufferIndentationInfo> {
        return this._indentationInfo
    }

    public async getCursorPosition(): Promise<types.Position> {
        return types.Position.create(this._cursor.line, this._cursor.column)
    }

    public setCursorPosition(line: number, column: number) {
        this._cursor.column = column
        this._cursor.line = line
    }

    public setLinesSync(lines: string[]): void {
        this._lines = lines
        this._modified = true
    }

    public setLineSync(line: number, lineContents: string): void {
        while (this._lines.length <= line) {
            this._lines.push("")
        }

        this._lines[line] = lineContents
        this._modified = true
    }

    public setWhitespace(indentationInfo: BufferIndentationInfo): void {
        this._indentationInfo = indentationInfo
    }

    public async setLines(start: number, end: number, lines: string[]): Promise<void> {
        while (this._lines.length <= end) {
            this._lines.push("")
        }

        for (let i = 0; i < lines.length; i++) {
            this._lines[start + i] = lines[i]
        }

        this._modified = true
    }

    public getLines(start: number = 0, end?: number): Promise<string[]> {
        if (typeof end !== "number") {
            end = this._lines.length
        }

        return Promise.resolve(this._lines.slice(start, end))
    }

    public updateHighlights(
        tokenColors: any[],
        updateFunction: (highlightUpdater: IBufferHighlightsUpdater) => void,
    ) {
        updateFunction(this._mockHighlights)
    }

    public addLayer(): void {
        // tslint:disable-line
    }

    public removeLayer(): void {
        // tslint:disable-line
    }
}

export class MockBufferHighlightsUpdater implements IBufferHighlightsUpdater {
    private _linesToHighlights: { [line: number]: HighlightInfo[] } = {}

    public setHighlightsForLine(line: number, highlights: HighlightInfo[]): void {
        this._linesToHighlights[line] = highlights
    }

    public clearHighlightsForLine(line: number): void {
        this._linesToHighlights[line] = null
    }

    public getHighlightsForLine(line: number): HighlightInfo[] {
        return this._linesToHighlights[line] || []
    }
}
