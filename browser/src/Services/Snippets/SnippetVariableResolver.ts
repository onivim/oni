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
            CURRENT_YEAR: currentDate.getFullYear().toString(),
            CURRENT_YEAR_SHORT: currentDate
                .getFullYear()
                .toString()
                .slice(-2),
            CURRENT_MONTH: (currentDate.getMonth() + 1).toString(),
            CURRENT_DATE: currentDate.getDate().toString(),
            CURRENT_HOUR: currentDate.getHours().toString(),
            CURRENT_MINUTE: currentDate.getMinutes().toString(),
            CURRENT_SECOND: currentDate.getSeconds().toString(),
            CURRENT_DAY_NAME: currentDate.toLocaleString("en-US", { weekday: "long" }),
            CURRENT_DAY_NAME_SHORT: currentDate.toLocaleString("en-US", { weekday: "short" }),
            CURRENT_MONTH_NAME: currentDate.toLocaleString("en-US", { month: "long" }),
            CURRENT_MONTH_NAME_SHORT: currentDate.toLocaleString("en-US", { month: "short" }),
            // SELECTION: "",
            // CLIPBOARD: "",
            // TM_SELECTED_TEXT: "",
            // TM_CURRENT_LINE: "",
            // TM_CURRENT_WORD: "",
            TM_LINE_INDEX: line.toString(),
            TM_LINE_NUMBER: (line + 1).toString(),
            TM_FILENAME: path.basename(filePath),
            TM_FILENAME_BASE: path.basename(filePath, path.extname(filePath)),
            TM_DIRECTORY: path.dirname(filePath),
            TM_FILEPATH: filePath,
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
