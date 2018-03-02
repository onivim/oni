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

        this._variableToValue = {
            TM_LINE_INDEX: this._buffer.cursor.line.toString(),
            TM_LINE_NUMBER: (this._buffer.cursor.line + 1).toString(),
            TM_FILENAME: path.basename(this._buffer.filePath),
            TM_DIRECTORY: path.dirname(this._buffer.filePath),
            TM_FILEPATH: this._buffer.filePath,
            TM_FILENAME_BASE: path.basename(
                this._buffer.filePath,
                path.extname(this._buffer.filePath),
            ),
            CURRENT_YEAR: currentDate.getFullYear().toString(),
            CURRENT_MONTH: currentDate.getMonth().toString(),
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
