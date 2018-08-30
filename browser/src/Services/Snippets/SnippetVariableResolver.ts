/**
 * Snippets.ts
 *
 * Manages snippet integration
 */

import * as path from "path"

import * as Oni from "oni-api"

import { Variable, VariableResolver } from "./OniSnippet"

export class SnippetVariableResolver implements VariableResolver {
    private _variableToValue: { [key: string]: string } = {}

    constructor(private _buffer: Oni.Buffer) {
        const currentDate = new Date()

        const line = this._buffer && this._buffer.cursor ? this._buffer.cursor.line : 0
        const filePath = this._buffer && this._buffer.filePath ? this._buffer.filePath : ""

        this._variableToValue = {
            TM_LINE_INDEX: line.toString(),
            TM_LINE_NUMBER: (line + 1).toString(),
            TM_FILENAME: path.basename(filePath),
            TM_DIRECTORY: path.dirname(filePath),
            TM_FILEPATH: filePath,
            TM_FILENAME_BASE: path.basename(filePath, path.extname(filePath)),
            CURRENT_YEAR: currentDate.getFullYear().toString(),
            CURRENT_MONTH: (currentDate.getMonth() + 1).toString(),
            CURRENT_DATE: currentDate.getDate().toString(),
            CURRENT_HOUR: currentDate.getHours().toString(),
            CURRENT_MINUTE: currentDate.getMinutes().toString(),
            CURRENT_SECOND: currentDate.getSeconds().toString(),
        }
    }

    public resolve(variable: Variable): string {
        const variableName = variable.name
        if (!this._variableToValue[variableName]) {
            return ""
        }

        return this._variableToValue[variableName]
    }
}
